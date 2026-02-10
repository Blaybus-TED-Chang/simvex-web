/**
 * [보류] 로봇 암 시뮬레이션 — 3D 모델 + 관절 애니메이션
 *
 * 현재 상태: 미사용 (simulationMapping.ts에서 robot-arm-combined 제거됨)
 *
 * 문제점:
 * - GLB에서 메시를 flat하게 추출(getWorldPosition/Quaternion) 후
 *   중첩 <group>으로 관절 계층(FK)을 재구성하는 방식은,
 *   각 관절의 피벗 포인트가 정확하지 않아 부품이 분리되고
 *   비현실적인 방향으로 회전하는 문제가 있음.
 *
 * 해결 방향 (추후):
 * - GLB 자체에 본(bone)/아마추어 계층이 포함된 리깅 모델 사용
 * - 또는 관절별 피벗 좌표를 수동으로 정의하여 오프셋 보정
 * - 또는 별도 3D 저작 도구에서 애니메이션 bake 후 GLB 애니메이션 클립 재생
 */
'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { robotArmCombinedModel } from '@/data/models/robotArmCombined';

interface ExtractedMesh {
  name: string;
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  color: string;
}

// Keyframes: [j1(base Y), j2(shoulder Z), j3(elbow Z), j4(wrist-pitch Z), j5(wrist-roll Y)] in degrees
const KEYFRAMES = [
  { time: 0, joints: [0, 0, 0, 0, 0] },
  { time: 2, joints: [40, -15, 25, -10, 30] },
  { time: 4, joints: [-20, -35, 50, 15, -20] },
  { time: 6, joints: [30, -10, 15, -25, 45] },
  { time: 8, joints: [-35, -25, 40, 10, -30] },
  { time: 10, joints: [0, 0, 0, 0, 0] },
];

const CYCLE_DURATION = KEYFRAMES[KEYFRAMES.length - 1].time;

function lerpAngle(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getJointsAtTime(time: number): number[] {
  const t = time % CYCLE_DURATION;
  let i = 0;
  for (let k = 0; k < KEYFRAMES.length - 1; k++) {
    if (t >= KEYFRAMES[k].time && t < KEYFRAMES[k + 1].time) {
      i = k;
      break;
    }
  }
  const kf0 = KEYFRAMES[i];
  const kf1 = KEYFRAMES[i + 1];
  const localT = (t - kf0.time) / (kf1.time - kf0.time);
  // Smooth step for natural motion
  const smooth = localT * localT * (3 - 2 * localT);
  return kf0.joints.map((v, j) => lerpAngle(v, kf1.joints[j], smooth));
}

// Which part IDs belong to each joint group
const JOINT_GROUPS: Record<string, string[]> = {
  // J1 rotates everything above base
  j1: ['shoulder', 'upper-arm', 'elbow', 'forearm', 'wrist-pitch', 'wrist-roll-a', 'wrist-roll-b', 'end-effector-a', 'end-effector-b'],
  // J2 rotates from shoulder up
  j2: ['upper-arm', 'elbow', 'forearm', 'wrist-pitch', 'wrist-roll-a', 'wrist-roll-b', 'end-effector-a', 'end-effector-b'],
  // J3 rotates from elbow up
  j3: ['forearm', 'wrist-pitch', 'wrist-roll-a', 'wrist-roll-b', 'end-effector-a', 'end-effector-b'],
  // J4 wrist pitch
  j4: ['wrist-roll-a', 'wrist-roll-b', 'end-effector-a', 'end-effector-b'],
  // J5 wrist roll
  j5: ['end-effector-a', 'end-effector-b'],
};

export interface RobotArmSimModelProps {
  isRunning: boolean;
  speed: number;
  onJointAnglesChange?: (angles: number[]) => void;
}

export default function RobotArmSimModel({ isRunning, speed, onJointAnglesChange }: RobotArmSimModelProps) {
  const { scene } = useGLTF('/models/robot-arm-combined/robot-arm-combined.glb');

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const part of robotArmCombinedModel.parts) {
      if (part.color) map.set(part.meshName, part.color);
    }
    return map;
  }, []);

  // Map meshName prefix → part id
  const meshToPartId = useMemo(() => {
    const map = new Map<string, string>();
    for (const part of robotArmCombinedModel.parts) {
      map.set(part.meshName, part.id);
    }
    return map;
  }, []);

  const [meshes, setMeshes] = useState<(ExtractedMesh & { partId: string })[]>([]);

  useEffect(() => {
    scene.updateMatrixWorld(true);
    const extracted: (ExtractedMesh & { partId: string })[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        child.getWorldPosition(worldPosition);
        child.getWorldQuaternion(worldQuaternion);
        child.getWorldScale(worldScale);

        // Find which part this mesh belongs to
        let partId = 'unknown';
        for (const [prefix, id] of meshToPartId) {
          if (child.name.startsWith(prefix)) {
            partId = id;
            break;
          }
        }

        extracted.push({
          name: child.name,
          geometry: child.geometry,
          position: worldPosition.clone(),
          quaternion: worldQuaternion.clone(),
          scale: worldScale.clone(),
          color: colorMap.get(child.name) || findColorByPrefix(child.name, colorMap) || '#888888',
          partId,
        });
      }
    });

    setMeshes(extracted);
  }, [scene, colorMap, meshToPartId]);

  // Animation time accumulator
  const timeRef = useRef(0);
  const currentAnglesRef = useRef([0, 0, 0, 0, 0]);

  // Joint pivot groups: refs for rotation groups
  const j1Ref = useRef<THREE.Group>(null);
  const j2Ref = useRef<THREE.Group>(null);
  const j3Ref = useRef<THREE.Group>(null);
  const j4Ref = useRef<THREE.Group>(null);
  const j5Ref = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!isRunning) return;

    timeRef.current += delta * speed;
    const angles = getJointsAtTime(timeRef.current);
    currentAnglesRef.current = angles;

    const [j1, j2, j3, j4, j5] = angles.map((d) => THREE.MathUtils.degToRad(d));

    if (j1Ref.current) j1Ref.current.rotation.y = j1;
    if (j2Ref.current) j2Ref.current.rotation.z = j2;
    if (j3Ref.current) j3Ref.current.rotation.z = j3;
    if (j4Ref.current) j4Ref.current.rotation.z = j4;
    if (j5Ref.current) j5Ref.current.rotation.y = j5;

    onJointAnglesChange?.(angles);
  });

  // Categorize meshes by joint group
  const categorized = useMemo(() => {
    const groups = {
      base: [] as typeof meshes,
      j1Only: [] as typeof meshes,  // shoulder itself
      j2Only: [] as typeof meshes,  // upper-arm, elbow
      j3Only: [] as typeof meshes,  // forearm, wrist-pitch
      j4Only: [] as typeof meshes,  // wrist-roll-a, wrist-roll-b
      j5Only: [] as typeof meshes,  // end-effector-a, end-effector-b
    };

    for (const m of meshes) {
      if (m.partId === 'base') {
        groups.base.push(m);
      } else if (JOINT_GROUPS.j5.includes(m.partId)) {
        groups.j5Only.push(m);
      } else if (JOINT_GROUPS.j4.includes(m.partId)) {
        groups.j4Only.push(m);
      } else if (JOINT_GROUPS.j3.includes(m.partId)) {
        groups.j3Only.push(m);
      } else if (JOINT_GROUPS.j2.includes(m.partId)) {
        groups.j2Only.push(m);
      } else if (JOINT_GROUPS.j1.includes(m.partId)) {
        groups.j1Only.push(m);
      } else {
        groups.base.push(m);
      }
    }

    return groups;
  }, [meshes]);

  const renderMeshes = useCallback((items: typeof meshes) => {
    return items.map((m, i) => (
      <mesh
        key={`${m.name}-${i}`}
        geometry={m.geometry}
        position={[m.position.x, m.position.y, m.position.z]}
        quaternion={new THREE.Quaternion(m.quaternion.x, m.quaternion.y, m.quaternion.z, m.quaternion.w)}
        scale={[m.scale.x, m.scale.y, m.scale.z]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={m.color} metalness={0.3} roughness={0.6} />
      </mesh>
    ));
  }, []);

  const modelScale = robotArmCombinedModel.scale ?? 1;

  return (
    <group scale={modelScale}>
      {/* Base - doesn't rotate */}
      {renderMeshes(categorized.base)}

      {/* J1: Base rotation (Y axis) - everything above base */}
      <group ref={j1Ref}>
        {renderMeshes(categorized.j1Only)}

        {/* J2: Shoulder rotation (Z axis) */}
        <group ref={j2Ref}>
          {renderMeshes(categorized.j2Only)}

          {/* J3: Elbow rotation (Z axis) */}
          <group ref={j3Ref}>
            {renderMeshes(categorized.j3Only)}

            {/* J4: Wrist pitch (Z axis) */}
            <group ref={j4Ref}>
              {renderMeshes(categorized.j4Only)}

              {/* J5: Wrist roll (Y axis) */}
              <group ref={j5Ref}>
                {renderMeshes(categorized.j5Only)}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// Helper: find color by mesh name prefix match
function findColorByPrefix(meshName: string, colorMap: Map<string, string>): string | undefined {
  for (const [prefix, color] of colorMap) {
    if (meshName.startsWith(prefix)) return color;
  }
  return undefined;
}
