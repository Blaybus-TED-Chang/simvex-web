'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import { useRobotStore } from '@/lib/store/robotStore';
import { solveIK, isReachable } from '@/lib/kinematics/inverseKinematics';
import * as THREE from 'three';

export default function TargetMarker() {
  const groupRef = useRef<THREE.Group>(null);
  const { targetPosition, setTargetPosition, joints, setJoints } = useRobotStore();
  const [localPosition, setLocalPosition] = useState<[number, number, number]>([
    targetPosition.x,
    targetPosition.y,
    targetPosition.z,
  ]);
  const [reachable, setReachable] = useState(true);
  const isDragging = useRef(false);

  useEffect(() => {
    setLocalPosition([targetPosition.x, targetPosition.y, targetPosition.z]);
  }, [targetPosition]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;

      const target = new THREE.Vector3(localPosition[0], localPosition[1], localPosition[2]);
      const canReach = isReachable(target);
      setReachable(canReach);

      if (canReach) {
        setTargetPosition({ x: localPosition[0], y: localPosition[1], z: localPosition[2] });

        const result = solveIK(target, joints);
        if (result.success) {
          setJoints(result.jointAngles);
        }
      }
    }
  }, [localPosition, joints, setJoints, setTargetPosition]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (isDragging.current && e.point) {
      setLocalPosition([e.point.x, Math.max(0.05, e.point.y), e.point.z]);
      setReachable(isReachable(new THREE.Vector3(e.point.x, e.point.y, e.point.z)));
    }
  }, []);

  return (
    <group ref={groupRef}>
      {/* Draggable target sphere */}
      <Sphere
        args={[0.06, 16, 16]}
        position={localPosition}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <meshStandardMaterial
          color={reachable ? '#22c55e' : '#ef4444'}
          transparent
          opacity={0.9}
          emissive={reachable ? '#22c55e' : '#ef4444'}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Vertical line to ground */}
      <Line
        points={[
          [localPosition[0], localPosition[1], localPosition[2]],
          [localPosition[0], 0, localPosition[2]],
        ]}
        color={reachable ? '#22c55e' : '#ef4444'}
        lineWidth={1}
        transparent
        opacity={0.5}
        dashed
        dashSize={0.05}
        gapSize={0.02}
      />

      {/* Ground indicator */}
      <mesh position={[localPosition[0], 0.001, localPosition[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.05, 16]} />
        <meshBasicMaterial color={reachable ? '#22c55e' : '#ef4444'} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
