'use client';

import { useRobotStore } from '@/lib/store/robotStore';

export default function WorkspaceVisualizer() {
  const { isDarkMode } = useRobotStore();

  // Approximate workspace dimensions based on arm lengths
  const outerRadius = 1.5; // Maximum reach
  const innerRadius = 0.2; // Minimum reach

  return (
    <group>
      {/* Outer sphere (max reach) */}
      <mesh>
        <sphereGeometry args={[outerRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color={isDarkMode ? '#3b82f6' : '#60a5fa'}
          transparent
          opacity={0.1}
          side={2} // DoubleSide
          depthWrite={false}
        />
      </mesh>

      {/* Outer wireframe */}
      <mesh>
        <sphereGeometry args={[outerRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color={isDarkMode ? '#3b82f6' : '#2563eb'}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>

      {/* Inner sphere (min reach) */}
      <mesh>
        <sphereGeometry args={[innerRadius, 16, 16]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>

      {/* Ground circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial
          color={isDarkMode ? '#3b82f6' : '#60a5fa'}
          transparent
          opacity={0.15}
          side={2}
        />
      </mesh>
    </group>
  );
}
