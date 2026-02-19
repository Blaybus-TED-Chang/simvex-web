'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRobotArmSimulatorStore } from '@/lib/store/robotArmSimulatorStore';
import { JOINT_CONFIGS, DH_PARAMS } from '@/types/robot';

const DEG2RAD = Math.PI / 180;

// 총 도달 거리 (작업 공간 구체 반지름 추정)
const TOTAL_REACH = DH_PARAMS.reduce((sum, p) => sum + Math.abs(p.d) + Math.abs(p.a), 0);

export default function RobotArmModel() {
  const { output, isRunning, showJointLabels, showWorkspace, params } =
    useRobotArmSimulatorStore();

  // 6개 관절 그룹 ref
  const jointRefs = useRef<(THREE.Group | null)[]>([null, null, null, null, null, null]);

  // Target rotation angles (degrees → radians)
  const targetAngles = useMemo(
    () => output.jointAngles.map((a) => a * DEG2RAD),
    [output.jointAngles],
  );

  // Animate joints with lerp
  useFrame((_state, delta) => {
    for (let i = 0; i < 6; i++) {
      const group = jointRefs.current[i];
      if (!group) continue;

      const target = targetAngles[i];
      const axis = JOINT_CONFIGS[i].axis;

      if (isRunning) {
        const lerpFactor = 1 - Math.pow(0.02, delta);
        if (axis === 'y') {
          group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target, lerpFactor);
        } else {
          group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target, lerpFactor);
        }
      } else {
        // Snap instantly
        if (axis === 'y') {
          group.rotation.y = target;
        } else {
          group.rotation.z = target;
        }
      }
    }
  });

  const j = JOINT_CONFIGS;
  const dh = DH_PARAMS;

  return (
    <group>
      {/* 작업 공간 구체 */}
      {showWorkspace && (
        <mesh position={[0, dh[0].d / 2, 0]}>
          <sphereGeometry args={[TOTAL_REACH, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* 베이스 플랫폼 */}
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 32]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* J1: Base — Y축 회전 */}
      <group ref={(el) => { jointRefs.current[0] = el; }}>
        {/* 관절 구체 */}
        <JointSphere color={j[0].color} radius={j[0].radius} position={[0, 0.05, 0]} />
        {showJointLabels && <JointLabel name="J1: Base" position={[0.25, 0.05, 0]} />}

        {/* 링크 1 (베이스→숄더) */}
        <LinkCylinder
          start={[0, 0.05, 0]}
          end={[0, dh[0].d, 0]}
          radius={j[0].radius * 0.7}
          color={j[0].color}
        />

        {/* J2: Shoulder — Z축 회전 */}
        <group position={[0, dh[0].d, 0]} ref={(el) => { jointRefs.current[1] = el; }}>
          <JointSphere color={j[1].color} radius={j[1].radius} />
          {showJointLabels && <JointLabel name="J2: Shoulder" position={[0.2, 0, 0]} />}

          {/* 링크 2 (숄더→엘보) — X 방향으로 dh[1].a 길이 */}
          <LinkCylinder
            start={[0, 0, 0]}
            end={[dh[1].a, 0, 0]}
            radius={j[1].radius * 0.7}
            color={j[1].color}
          />

          {/* J3: Elbow — Z축 회전 */}
          <group position={[dh[1].a, 0, 0]} ref={(el) => { jointRefs.current[2] = el; }}>
            <JointSphere color={j[2].color} radius={j[2].radius} />
            {showJointLabels && <JointLabel name="J3: Elbow" position={[0.18, 0, 0]} />}

            {/* 링크 3 (엘보→손목1) */}
            <LinkCylinder
              start={[0, 0, 0]}
              end={[dh[2].a, 0, 0]}
              radius={j[2].radius * 0.7}
              color={j[2].color}
            />

            {/* J4: Wrist 1 — Z축 회전 */}
            <group position={[dh[2].a, 0, 0]} ref={(el) => { jointRefs.current[3] = el; }}>
              <JointSphere color={j[3].color} radius={j[3].radius} />
              {showJointLabels && <JointLabel name="J4: Wrist1" position={[0.15, 0, 0]} />}

              {/* 링크 4 */}
              <LinkCylinder
                start={[0, 0, 0]}
                end={[dh[3].a, 0, 0]}
                radius={j[3].radius * 0.6}
                color={j[3].color}
              />

              {/* J5: Wrist 2 — Y축 회전 */}
              <group position={[dh[3].a, 0, 0]} ref={(el) => { jointRefs.current[4] = el; }}>
                <JointSphere color={j[4].color} radius={j[4].radius} />
                {showJointLabels && <JointLabel name="J5: Wrist2" position={[0.12, 0, 0]} />}

                {/* 링크 5 */}
                <LinkCylinder
                  start={[0, 0, 0]}
                  end={[0, dh[4].d, 0]}
                  radius={j[4].radius * 0.6}
                  color={j[4].color}
                />

                {/* J6: Wrist 3 — Z축 회전 */}
                <group position={[0, dh[4].d, 0]} ref={(el) => { jointRefs.current[5] = el; }}>
                  <JointSphere color={j[5].color} radius={j[5].radius} />
                  {showJointLabels && <JointLabel name="J6: Wrist3" position={[0.1, 0, 0]} />}

                  {/* 엔드이펙터 */}
                  <mesh position={[0, dh[5].d, 0]} castShadow>
                    <coneGeometry args={[0.03, 0.06, 8]} />
                    <meshStandardMaterial color="#FF4444" metalness={0.4} roughness={0.5} />
                  </mesh>
                  <axesHelper args={[0.15]} position={[0, dh[5].d, 0]} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* IK 타겟 마커 */}
      {params.mode === 'ik' && (
        <group position={[params.ikTarget.x, params.ikTarget.y, params.ikTarget.z]}>
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
          </mesh>
          <axesHelper args={[0.12]} />
        </group>
      )}
    </group>
  );
}

// ── Sub-components ──

function JointSphere({ color, radius, position }: { color: string; radius: number; position?: [number, number, number] }) {
  return (
    <mesh position={position || [0, 0, 0]} castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
    </mesh>
  );
}

function LinkCylinder({
  start,
  end,
  radius,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
}) {
  const startV = useMemo(() => new THREE.Vector3(...start), [start]);
  const endV = useMemo(() => new THREE.Vector3(...end), [end]);
  const length = useMemo(() => startV.distanceTo(endV), [startV, endV]);
  const midpoint = useMemo(() => startV.clone().add(endV).multiplyScalar(0.5), [startV, endV]);

  const quaternion = useMemo(() => {
    const dir = endV.clone().sub(startV).normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [startV, endV]);

  if (length < 0.001) return null;

  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} transparent opacity={0.85} />
    </mesh>
  );
}

function JointLabel({ name, position }: { name: string; position: [number, number, number] }) {
  return (
    <Html position={position} distanceFactor={4} center>
      <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
        {name}
      </div>
    </Html>
  );
}
