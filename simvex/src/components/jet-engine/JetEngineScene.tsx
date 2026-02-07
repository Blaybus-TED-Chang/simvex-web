'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useJetEngineStore } from '@/lib/store/jetEngineStore';
import JetEngineModel from './JetEngineModel';
import AirflowParticles from './AirflowParticles';

interface JetEngineSceneProps {
  isDarkMode?: boolean;
}

export default function JetEngineScene({ isDarkMode = true }: JetEngineSceneProps) {
  const { showParticles, showCutaway } = useJetEngineStore();

  const groundColor = isDarkMode ? '#1a1a2e' : '#e2e8f0';
  const fogColor = isDarkMode ? '#0f172a' : '#f1f5f9';

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={isDarkMode ? 1.2 : 1.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={isDarkMode ? 2 : 2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 5, -5]} intensity={isDarkMode ? 1.5 : 1.8} />
      <directionalLight position={[0, -5, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[2, 2, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-2, 2, 0]} intensity={0.8} color="#ffffff" />
      <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#444444" />

      {/* Engine Model */}
      <JetEngineModel cutaway={showCutaway} />

      {/* Air Flow Particles */}
      {showParticles && <AirflowParticles />}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>

      {/* Controls */}
      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={15}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2}
        enableDamping
        dampingFactor={0.05}
      />

      <fog attach="fog" args={[fogColor, 10, 30]} />
    </Canvas>
  );
}
