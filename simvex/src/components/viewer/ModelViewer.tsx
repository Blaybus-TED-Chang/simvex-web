'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { ModelConfig, PartConfig } from '@/types/viewer';
import { useViewerStore } from '@/lib/store/viewerStore';
import { GLBPart } from './GLBPart';
import * as THREE from 'three';

interface ModelViewerProps {
  model: ModelConfig;
  debugMode?: boolean;
  overrideParts?: Map<string, Partial<PartConfig>>;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  onCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

// 카메라 위치 추적 컴포넌트
function CameraTracker({ onCameraChange }: { onCameraChange?: (pos: [number, number, number], target: [number, number, number]) => void }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!onCameraChange) return;

    const interval = setInterval(() => {
      const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];
      // OrbitControls의 target을 가져오기 어려우므로 기본값 사용
      onCameraChange(pos, [0, 0, 0]);
    }, 500);

    return () => clearInterval(interval);
  }, [camera, onCameraChange]);

  return null;
}

function Scene({
  model,
  isDarkMode,
  overrideParts,
  cameraTarget,
  onCameraChange,
}: {
  model: ModelConfig;
  isDarkMode: boolean;
  overrideParts?: Map<string, Partial<PartConfig>>;
  cameraTarget?: [number, number, number];
  onCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
}) {
  const {
    explodeValue,
    selectedPartId,
    hoveredPartId,
    visibleParts,
    setSelectedPartId,
    setHoveredPartId,
  } = useViewerStore();

  // 오버라이드된 부품 값 적용
  const getPartWithOverrides = (part: PartConfig): PartConfig => {
    if (!overrideParts) return part;
    const overrides = overrideParts.get(part.id);
    if (!overrides) return part;
    return { ...part, ...overrides };
  };

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={isDarkMode ? 1.2 : 1.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={isDarkMode ? 1.5 : 1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={isDarkMode ? 0.8 : 1.0} />
      <directionalLight position={[0, -5, 0]} intensity={isDarkMode ? 0.4 : 0.6} />
      <directionalLight position={[5, 0, -5]} intensity={isDarkMode ? 0.5 : 0.7} />

      {/* 카메라 추적 */}
      {onCameraChange && <CameraTracker onCameraChange={onCameraChange} />}

      {/* 부품들 렌더링 */}
      <Suspense fallback={<LoadingFallback />}>
        <group>
          {model.parts.map((part) => (
            <GLBPart
              key={part.id}
              part={getPartWithOverrides(part)}
              basePath={model.basePath}
              explodeValue={explodeValue}
              isSelected={selectedPartId === part.id}
              isHovered={hoveredPartId === part.id}
              isVisible={visibleParts.includes(part.id)}
              onClick={() => setSelectedPartId(part.id)}
              onPointerOver={() => setHoveredPartId(part.id)}
              onPointerOut={() => setHoveredPartId(null)}
            />
          ))}
        </group>
      </Suspense>

      {/* 축 인디케이터 (Gizmo) */}
      <GizmoHelper alignment="top-right" margin={[72, 72]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>

      {/* 그리드 */}
      <Grid
        args={[20, 20]}
        position={[0, -0.01, 0]}
        cellSize={0.1}
        cellThickness={0.5}
        cellColor={isDarkMode ? '#404040' : '#c0c0c0'}
        sectionSize={0.5}
        sectionThickness={1}
        sectionColor={isDarkMode ? '#606060' : '#a0a0a0'}
        fadeDistance={10}
        fadeStrength={1}
      />

      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={isDarkMode ? '#1a1a1a' : '#e8e8e8'}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 카메라 컨트롤 */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={30}
        target={cameraTarget || model.cameraTarget || [0, 0, 0]}
      />
    </>
  );
}

export function ModelViewer({
  model,
  debugMode = false,
  overrideParts,
  cameraPosition,
  cameraTarget,
  onCameraChange,
}: ModelViewerProps) {
  const { setSelectedPartId, isDarkMode } = useViewerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const bgColor = isDarkMode ? '#111' : '#f5f5f5';
  const gradientFrom = isDarkMode ? 'from-gray-900' : 'from-gray-100';
  const gradientTo = isDarkMode ? 'to-gray-950' : 'to-gray-200';

  const finalCameraPosition = cameraPosition || model.cameraPosition || [5, 3, 5];

  if (!mounted) {
    return (
      <div className={`w-full h-full bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>3D 뷰어 초기화 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-lg overflow-hidden relative`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: finalCameraPosition,
          fov: 50,
          near: 0.01,
          far: 100,
        }}
        onPointerMissed={() => setSelectedPartId(null)}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 10, 50]} />
        <Scene
          model={model}
          isDarkMode={isDarkMode}
          overrideParts={overrideParts}
          cameraTarget={cameraTarget}
          onCameraChange={onCameraChange}
        />
      </Canvas>

      {/* 좌표축 범례 (디버그 모드) */}
      {debugMode && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
          <div className="flex items-center gap-2">
            <span className="text-red-500">X (Right)</span>
            <span className="text-green-500">Y (Up)</span>
            <span className="text-blue-500">Z (Front)</span>
          </div>
        </div>
      )}
    </div>
  );
}
