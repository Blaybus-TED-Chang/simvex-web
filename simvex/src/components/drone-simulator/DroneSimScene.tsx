'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import DroneSimModel from './DroneSimModel';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  );
}

export default function DroneSimScene() {
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
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <directionalLight position={[0, -5, 0]} intensity={0.4} />
      <directionalLight position={[5, 0, -5]} intensity={0.5} />

      {/* Drone Model — Suspense로 감싸야 useGLTF 로딩 중 Context Loss 방지 */}
      <Suspense fallback={<LoadingFallback />}>
        <DroneSimModel />
      </Suspense>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[30, 30, '#333355', '#222244']} position={[0, -1.49, 0]} />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={30}
      />

      <fog attach="fog" args={['#0f172a', 15, 40]} />
    </Canvas>
  );
}
