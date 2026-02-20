'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import RobotArmModel from './RobotArmModel';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  );
}

interface RobotArmSceneProps {
  isDarkMode?: boolean;
}

export default function RobotArmScene({ isDarkMode = true }: RobotArmSceneProps) {
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
      <PerspectiveCamera makeDefault position={[2, 2, 2]} fov={50} near={0.01} far={100} />

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

      {/* Robot Arm Model */}
      <Suspense fallback={<LoadingFallback />}>
        <RobotArmModel />
      </Suspense>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[20, 20, gridColors[0], gridColors[1]]} position={[0, 0, 0]} />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
      />
      <SmoothZoom />

      {/* Gizmo */}
      <GizmoHelper alignment="top-right" margin={[72, 72]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>

      <fog attach="fog" args={[fogColor, 10, 30]} />
    </Canvas>
  );
}

// ── SmoothZoom (뷰어와 동일한 부드러운 휠 줌) ──

const _smoothZoomDir = new THREE.Vector3();
const _smoothZoomFallback = new THREE.Vector3(0, 0, 0);

function SmoothZoom() {
  const { camera, controls } = useThree();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const velocityRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const canvas = (controls as unknown as { domElement?: HTMLCanvasElement })?.domElement
      ?? document.querySelector('canvas');
    if (!canvas) return;
    canvasRef.current = canvas;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * 0.0008;
      activeRef.current = true;
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [controls]);

  useFrame(() => {
    if (!activeRef.current) return;

    const v = velocityRef.current;
    if (Math.abs(v) < 0.0005) {
      velocityRef.current = 0;
      activeRef.current = false;
      return;
    }

    const orbitTarget = controls && 'target' in controls
      ? (controls as unknown as { target: THREE.Vector3 }).target
      : _smoothZoomFallback;

    _smoothZoomDir.subVectors(camera.position, orbitTarget);
    const dist = _smoothZoomDir.length();
    const move = v * (0.4 + dist * 0.25);
    const newDist = Math.max(0.3, Math.min(30, dist + move));

    _smoothZoomDir.normalize().multiplyScalar(newDist);
    camera.position.copy(orbitTarget).add(_smoothZoomDir);

    velocityRef.current *= 0.75;
  });

  return null;
}
