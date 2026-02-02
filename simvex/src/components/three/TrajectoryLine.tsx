'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useRobotStore } from '@/lib/store/robotStore';

export default function TrajectoryLine() {
  const { waypoints, currentWaypointIndex } = useRobotStore();

  const points = useMemo(() => {
    return waypoints.map(wp => [wp.position.x, wp.position.y, wp.position.z] as [number, number, number]);
  }, [waypoints]);

  if (points.length < 2) return null;

  return (
    <group>
      {/* Trajectory line */}
      <Line
        points={points}
        color="#4ECDC4"
        lineWidth={2}
        dashed={false}
      />

      {/* Waypoint markers */}
      {waypoints.map((wp, i) => (
        <group key={wp.id} position={[wp.position.x, wp.position.y, wp.position.z]}>
          <mesh>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial
              color={i === currentWaypointIndex ? '#fbbf24' : '#4ECDC4'}
              emissive={i === currentWaypointIndex ? '#fbbf24' : '#4ECDC4'}
              emissiveIntensity={i === currentWaypointIndex ? 0.5 : 0.2}
            />
          </mesh>

          {/* Number label using simple mesh */}
          <mesh position={[0, 0.08, 0]}>
            <planeGeometry args={[0.05, 0.05]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
