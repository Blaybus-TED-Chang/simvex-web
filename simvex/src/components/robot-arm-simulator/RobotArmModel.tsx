'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRobotArmSimulatorStore } from '@/lib/store/robotArmSimulatorStore';
import { JOINT_CONFIGS, DH_PARAMS } from '@/types/robot';
import { robotArmCombinedModel } from '@/data/models/robotArmCombined';
import {
  DEFAULT_ROBOT_ARM_PARAMS,
  calculateFKFull,
  mul4,
  invertRigidMat4,
  type Mat4,
} from '@/types/robotArmSimulator';

const GLB_PATH = '/models/robot-arm-combined/robot-arm-combined.glb';
const GLB_SCALE = 0.1;
const TOTAL_REACH = DH_PARAMS.reduce((sum, p) => sum + Math.abs(p.d) + Math.abs(p.a), 0);

// Part ID → index into the transforms array (0=static base, 1=after J1, ..., 6=after J6)
const PART_FRAME: Record<string, number> = {
  'base': 0,
  'shoulder': 1,
  'upper-arm': 2,
  'elbow': 3,
  'forearm': 4,
  'wrist-pitch': 5,
  'wrist-roll-a': 6,
  'wrist-roll-b': 6,
  'end-effector-a': 6,
  'end-effector-b': 6,
};

// ── Row-major Mat4 ↔ THREE.Matrix4 conversion ──

function threeToMat4(m: THREE.Matrix4): Mat4 {
  const e = m.elements; // column-major
  return [
    e[0], e[4], e[8],  e[12],
    e[1], e[5], e[9],  e[13],
    e[2], e[6], e[10], e[14],
    e[3], e[7], e[11], e[15],
  ];
}

function mat4ToThree(m: Mat4, out: THREE.Matrix4): void {
  out.set(
    m[0],  m[1],  m[2],  m[3],
    m[4],  m[5],  m[6],  m[7],
    m[8],  m[9],  m[10], m[11],
    m[12], m[13], m[14], m[15],
  );
}

// ── Cached mesh data ──

interface CachedMeshData {
  mesh: THREE.Mesh;
  frameIndex: number;
  cachedLocal: Mat4; // inv(T_rest[frame]) × M_dh_scaled
}

/**
 * GLB 모델 기반 로봇팔 렌더링.
 * DH 변환 행렬의 상대 변환 방식으로 각 부품을 관절각에 따라 배치.
 */
export default function RobotArmModel() {
  // ── Store subscriptions ──
  const output = useRobotArmSimulatorStore((s) => s.output);
  const isRunning = useRobotArmSimulatorStore((s) => s.isRunning);
  const showJointLabels = useRobotArmSimulatorStore((s) => s.showJointLabels);
  const showWorkspace = useRobotArmSimulatorStore((s) => s.showWorkspace);
  const mode = useRobotArmSimulatorStore((s) => s.params.mode);
  const ikTarget = useRobotArmSimulatorStore((s) => s.params.ikTarget);
  const isPlayingWaypoints = useRobotArmSimulatorStore((s) => s.isPlayingWaypoints);
  const playbackSpeed = useRobotArmSimulatorStore((s) => s.playbackSpeed);
  const advanceWaypoint = useRobotArmSimulatorStore((s) => s.advanceWaypoint);

  // ── GLB loading ──
  const { scene } = useGLTF(GLB_PATH);

  // Pre-allocated THREE objects for useFrame (avoid per-frame allocation)
  const _matrix = useMemo(() => new THREE.Matrix4(), []);
  const _pos = useMemo(() => new THREE.Vector3(), []);
  const _quat = useMemo(() => new THREE.Quaternion(), []);
  const _scl = useMemo(() => new THREE.Vector3(), []);

  // Animated joint angles (lerped toward target)
  const animatedAngles = useRef<number[]>([...DEFAULT_ROBOT_ARM_PARAMS.jointAngles]);

  // Animated joint positions for labels (mutated in-place by useFrame)
  const animatedJointPositions = useRef<[number, number, number][]>(
    output.jointPositions.map((p) => [...p]),
  );

  // Waypoint playback timer
  const waypointTimer = useRef(0);

  // ── Build flattened scene + cache per-mesh local transforms ──
  const { flatGroup, meshDataList } = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.updateWorldMatrix(true, true);

    // Rest pose DH transforms (7 matrices: identity + 6 DH frames)
    const restTransforms = calculateFKFull(DEFAULT_ROBOT_ARM_PARAMS.jointAngles).transforms;

    const group = new THREE.Group();
    const dataList: CachedMeshData[] = [];

    // Collect all meshes first (traverse is depth-first, safe to collect)
    const allMeshes: THREE.Mesh[] = [];
    cloned.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        allMeshes.push(node);
      }
    });

    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();

    for (const mesh of allMeshes) {
      // Match mesh name to part config (prefix match)
      const partConfig = robotArmCombinedModel.parts.find(
        (p) => mesh.name.startsWith(p.meshName),
      );
      const frameIndex = partConfig ? PART_FRAME[partConfig.id] : undefined;

      // Store world matrix before detaching
      const worldMatrix = mesh.matrixWorld.clone();
      mesh.removeFromParent();

      // Decompose, apply GLB scale, recompose
      worldMatrix.decompose(pos, quat, scl);
      pos.multiplyScalar(GLB_SCALE);
      scl.multiplyScalar(GLB_SCALE);

      mesh.position.copy(pos);
      mesh.quaternion.copy(quat);
      mesh.scale.copy(scl);

      // Apply part color from config
      if (partConfig?.color) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.color.set(partConfig.color);
        mat.metalness = 0.4;
        mat.roughness = 0.4;
        mesh.material = mat;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      if (frameIndex !== undefined) {
        // Compute cached local matrix: inv(T_rest[frame]) × M_dh_scaled
        const composedMatrix = new THREE.Matrix4().compose(pos, quat, scl);
        const mDhRow = threeToMat4(composedMatrix);
        const invRest = invertRigidMat4(restTransforms[frameIndex]);
        const cachedLocal = mul4(invRest, mDhRow);

        dataList.push({ mesh, frameIndex, cachedLocal });
      }
    }

    return { flatGroup: group, meshDataList: dataList };
  }, [scene]);

  // ── Animation loop ──
  useFrame((_state, delta) => {
    // 1. Lerp joint angles toward target
    const target = output.jointAngles;
    const lerpFactor = isRunning ? 1 - Math.pow(0.02, delta) : 1;
    for (let i = 0; i < 6; i++) {
      animatedAngles.current[i] = THREE.MathUtils.lerp(
        animatedAngles.current[i],
        target[i],
        lerpFactor,
      );
    }

    // 2. FK with lerped angles → transforms + joint positions
    const fkResult = calculateFKFull(animatedAngles.current);
    const currentTransforms = fkResult.transforms;

    // 3. Update animated joint positions (for labels / axes helper)
    for (let i = 0; i < fkResult.jointPositions.length; i++) {
      const jp = fkResult.jointPositions[i];
      animatedJointPositions.current[i][0] = jp[0];
      animatedJointPositions.current[i][1] = jp[1];
      animatedJointPositions.current[i][2] = jp[2];
    }

    // 4. Apply DH-based transforms to each GLB mesh
    for (const { mesh, frameIndex, cachedLocal } of meshDataList) {
      const mNew = mul4(currentTransforms[frameIndex], cachedLocal);
      mat4ToThree(mNew, _matrix);
      _matrix.decompose(_pos, _quat, _scl);
      mesh.position.copy(_pos);
      mesh.quaternion.copy(_quat);
      mesh.scale.copy(_scl);
    }

    // 5. Waypoint playback driver
    if (isPlayingWaypoints) {
      waypointTimer.current += delta * playbackSpeed;
      if (waypointTimer.current >= 1.5) {
        waypointTimer.current = 0;
        advanceWaypoint();
      }
    } else {
      waypointTimer.current = 0;
    }
  });

  // Read animated positions (mutated in-place by useFrame, read on React re-render)
  // eslint-disable-next-line react-hooks/refs
  const positions = animatedJointPositions.current;

  return (
    <group>
      {/* GLB model (flattened, transforms managed by useFrame) */}
      <primitive object={flatGroup} />

      {/* Workspace sphere */}
      {showWorkspace && (
        <mesh position={[0, DH_PARAMS[0].d / 2, 0]}>
          <sphereGeometry args={[TOTAL_REACH, 32, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Joint labels */}
      {showJointLabels &&
        positions.slice(0, JOINT_CONFIGS.length).map((pos, i) => (
          <Html
            key={JOINT_CONFIGS[i].id}
            position={[pos[0] + 0.15, pos[1] + 0.08, pos[2]]}
            distanceFactor={4}
            center
          >
            <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
              J{i + 1}: {JOINT_CONFIGS[i].name}
            </div>
          </Html>
        ))}

      {/* End effector axes helper */}
      {positions.length > 6 && (
        <axesHelper args={[0.15]} position={positions[6]} />
      )}

      {/* IK target marker */}
      {mode === 'ik' && (
        <group position={[ikTarget.x, ikTarget.y, ikTarget.z]}>
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={0.5}
            />
          </mesh>
          <axesHelper args={[0.12]} />
        </group>
      )}
    </group>
  );
}

useGLTF.preload(GLB_PATH);
