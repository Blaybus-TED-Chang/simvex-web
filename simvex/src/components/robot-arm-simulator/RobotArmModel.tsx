'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRobotArmSimulatorStore } from '@/lib/store/robotArmSimulatorStore';
import { JOINT_CONFIGS, DH_PARAMS } from '@/types/robot';

const TOTAL_REACH = DH_PARAMS.reduce((sum, p) => sum + Math.abs(p.d) + Math.abs(p.a), 0);

/**
 * FK 결과의 jointPositions를 직접 사용하여 렌더링.
 * DH alpha 회전 불일치 문제를 근본적으로 해결.
 */
export default function RobotArmModel() {
  const output = useRobotArmSimulatorStore((s) => s.output);
  const isRunning = useRobotArmSimulatorStore((s) => s.isRunning);
  const showJointLabels = useRobotArmSimulatorStore((s) => s.showJointLabels);
  const showWorkspace = useRobotArmSimulatorStore((s) => s.showWorkspace);
  const mode = useRobotArmSimulatorStore((s) => s.params.mode);
  const ikTarget = useRobotArmSimulatorStore((s) => s.params.ikTarget);
  const isPlayingWaypoints = useRobotArmSimulatorStore((s) => s.isPlayingWaypoints);
  const playbackSpeed = useRobotArmSimulatorStore((s) => s.playbackSpeed);
  const advanceWaypoint = useRobotArmSimulatorStore((s) => s.advanceWaypoint);

  // 애니메이션용 보간 위치 (7개 관절 위치)
  const animatedPositions = useRef<[number, number, number][]>(
    output.jointPositions.map((p) => [...p]),
  );

  // 웨이포인트 재생 타이머
  const waypointTimer = useRef(0);

  // 목표 위치
  const targetPositions = useMemo(() => output.jointPositions, [output.jointPositions]);

  // 매 프레임 보간 + 웨이포인트 재생
  useFrame((_state, delta) => {
    // 위치 보간
    const lerpFactor = isRunning ? 1 - Math.pow(0.02, delta) : 1;
    for (let i = 0; i < targetPositions.length; i++) {
      for (let c = 0; c < 3; c++) {
        animatedPositions.current[i][c] = THREE.MathUtils.lerp(
          animatedPositions.current[i][c],
          targetPositions[i][c],
          lerpFactor,
        );
      }
    }

    // 웨이포인트 순차 재생 드라이버
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

  // 렌더링용 위치 (useFrame에서 갱신되므로 매 프레임 반영)
  const positions = animatedPositions.current;

  return (
    <group>
      {/* 작업 공간 구체 */}
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

      {/* 베이스 플랫폼 */}
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 32]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* 관절 구체 + 라벨 */}
      {positions.map((pos, i) => {
        if (i >= JOINT_CONFIGS.length) return null; // 엔드이펙터는 아래서 별도 처리
        const joint = JOINT_CONFIGS[i];
        return (
          <group key={joint.id}>
            <mesh position={pos} castShadow>
              <sphereGeometry args={[joint.radius, 16, 16]} />
              <meshStandardMaterial color={joint.color} metalness={0.4} roughness={0.4} />
            </mesh>
            {showJointLabels && (
              <Html
                position={[pos[0] + 0.15, pos[1] + 0.08, pos[2]]}
                distanceFactor={4}
                center
              >
                <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                  J{i + 1}: {joint.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* 링크 (관절 간 실린더) */}
      {positions.map((pos, i) => {
        if (i >= positions.length - 1) return null;
        const nextPos = positions[i + 1];
        const joint = i < JOINT_CONFIGS.length ? JOINT_CONFIGS[i] : JOINT_CONFIGS[5];
        return (
          <LinkCylinder
            key={`link-${i}`}
            start={pos}
            end={nextPos}
            radius={joint.radius * 0.6}
            color={joint.color}
          />
        );
      })}

      {/* 엔드이펙터 (마지막 jointPositions) */}
      {positions.length > 6 && (
        <group>
          <mesh position={positions[6]} castShadow>
            <coneGeometry args={[0.03, 0.06, 8]} />
            <meshStandardMaterial color="#FF4444" metalness={0.4} roughness={0.5} />
          </mesh>
          <axesHelper args={[0.15]} position={positions[6]} />
        </group>
      )}

      {/* IK 타겟 마커 */}
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

// ── LinkCylinder ──

const _startV = new THREE.Vector3();
const _endV = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();

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
  _startV.set(start[0], start[1], start[2]);
  _endV.set(end[0], end[1], end[2]);
  const length = _startV.distanceTo(_endV);
  if (length < 0.001) return null;

  _mid.copy(_startV).add(_endV).multiplyScalar(0.5);
  _dir.copy(_endV).sub(_startV).normalize();
  _quat.setFromUnitVectors(_up, _dir);

  return (
    <mesh
      position={[_mid.x, _mid.y, _mid.z]}
      quaternion={[_quat.x, _quat.y, _quat.z, _quat.w]}
      castShadow
    >
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.5}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}
