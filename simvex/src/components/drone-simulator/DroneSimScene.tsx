'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei';
import DroneSimModel from './DroneSimModel';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  );
}

interface DroneSimSceneProps {
  isDarkMode?: boolean;
}

export default function DroneSimScene({ isDarkMode = true }: DroneSimSceneProps) {
  const groundColor = isDarkMode ? '#1a1a2e' : '#e2e8f0';
  const gridColors: [string, string] = isDarkMode ? ['#333355', '#222244'] : ['#94a3b8', '#cbd5e1'];
  const fogColor = isDarkMode ? '#0f172a' : '#f1f5f9';

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
    >
      <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={50} near={0.01} far={100} />

      {/* Lighting */}
      <ambientLight intensity={isDarkMode ? 1.2 : 1.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={isDarkMode ? 1.5 : 2.0}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={isDarkMode ? 0.8 : 1.0} />
      <directionalLight position={[0, -5, 0]} intensity={0.4} />
      <directionalLight position={[5, 0, -5]} intensity={0.5} />

      {/* Drone Model */}
      <Suspense fallback={<LoadingFallback />}>
        <DroneSimModel />
      </Suspense>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[30, 30, gridColors[0], gridColors[1]]} position={[0, -1.49, 0]} />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={30}
      />

      {/* 축 인디케이터 (Gizmo) */}
      <GizmoHelper alignment="top-right" margin={[72, 72]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>

      <fog attach="fog" args={[fogColor, 15, 40]} />
    </Canvas>
  );
}
