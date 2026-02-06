'use client';

import { useRef, useMemo, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

// 텍스쳐 관련 경고/에러 억제
const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args) => {
  const msg = String(args[0] || '');
  if (msg.includes('texture') || msg.includes('Texture') || msg.includes('GLTFLoader')) return;
  originalWarn.apply(console, args);
};
console.error = (...args) => {
  const msg = String(args[0] || '');
  if (msg.includes('texture') || msg.includes('Texture') || msg.includes('GLTFLoader') || msg.includes('.png') || msg.includes('.jpg')) return;
  originalError.apply(console, args);
};

// 통합 GLB에서 추출된 부품 설정
export interface CombinedPartConfig {
  id: string;
  meshName: string;           // GLB 내부의 메시 이름
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  explodeDirection: [number, number, number];
  explodeDistance: number;
  color?: string;
}

export interface CombinedModelConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
  thumbnail: string;
  thumbnails?: string[];      // 슬라이드쇼용 썸네일 배열
  glbPath: string;            // 통합 GLB 파일 경로
  scale?: number;             // 모델 전체 스케일 (기본값 1)
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  parts: CombinedPartConfig[];
}

interface ExtractedMeshData {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  worldPosition: THREE.Vector3;
  worldQuaternion: THREE.Quaternion;
  worldScale: THREE.Vector3;
  partConfig: CombinedPartConfig;
}

interface CombinedGLBViewerProps {
  model: CombinedModelConfig;
  explodeValue: number;
  selectedPartId: string | null;
  hoveredPartId: string | null;
  visibleParts: string[];
  onSelectPart: (partId: string) => void;
  onHoverPart: (partId: string | null) => void;
  onDebugInfo?: (info: { meshCount: number; partIds: string[]; allMeshNames: string[] }) => void;
}

// Individual part mesh component
function PartMesh({
  meshData,
  explodeValue,
  isSelected,
  isHovered,
  isVisible,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  meshData: ExtractedMeshData;
  explodeValue: number;
  isSelected: boolean;
  isHovered: boolean;
  isVisible: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { worldPosition, worldQuaternion, worldScale, partConfig, geometry, material } = meshData;

  // Calculate exploded position
  const [dx, dy, dz] = partConfig.explodeDirection;
  const dist = partConfig.explodeDistance * explodeValue;

  const position: [number, number, number] = [
    worldPosition.x + dx * dist,
    worldPosition.y + dy * dist,
    worldPosition.z + dz * dist,
  ];

  // Create material with base color from config
  const clonedMaterial = useMemo(() => {
    // 새로운 MeshStandardMaterial 생성하고 color 적용
    const mat = new THREE.MeshStandardMaterial({
      color: partConfig.color || '#888888',
      metalness: 0.3,
      roughness: 0.6,
    });
    return mat;
  }, [partConfig.color]);

  // Update emissive for highlight
  useEffect(() => {
    const mat = clonedMaterial as THREE.MeshStandardMaterial;
    if (mat && mat.emissive) {
      if (isSelected) {
        mat.emissive.setHex(0x0066ff);
        mat.emissiveIntensity = 0.5;
      } else if (isHovered) {
        mat.emissive.setHex(0x00aaff);
        mat.emissiveIntensity = 0.3;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  }, [clonedMaterial, isSelected, isHovered]);

  if (!isVisible) return null;

  // Convert to arrays for R3F
  const quaternionArray: [number, number, number, number] = [
    worldQuaternion.x,
    worldQuaternion.y,
    worldQuaternion.z,
    worldQuaternion.w,
  ];

  const scaleArray: [number, number, number] = [
    worldScale.x,
    worldScale.y,
    worldScale.z,
  ];

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={clonedMaterial}
      position={position}
      quaternion={quaternionArray}
      scale={scaleArray}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onPointerOut();
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

export function CombinedGLBViewer({
  model,
  explodeValue,
  selectedPartId,
  hoveredPartId,
  visibleParts,
  onSelectPart,
  onHoverPart,
  onDebugInfo,
}: CombinedGLBViewerProps) {
  const { scene } = useGLTF(model.glbPath);
  const [extractedMeshes, setExtractedMeshes] = useState<ExtractedMeshData[]>([]);

  // 메시 이름 → 부품 설정 매핑
  const meshToPartMap = useMemo(() => {
    const map = new Map<string, CombinedPartConfig>();
    model.parts.forEach(part => {
      map.set(part.meshName, part);
    });
    return map;
  }, [model.parts]);

  // 씬에서 메시 추출
  useEffect(() => {
    const extracted: ExtractedMeshData[] = [];
    const allMeshNames: string[] = [];

    console.log('=== GLB 메시 추출 시작 ===');

    // 씬의 월드 행렬 업데이트
    scene.updateMatrixWorld(true);

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(`Found mesh: "${child.name}"`);
        allMeshNames.push(child.name || '(unnamed)');

        // 정확한 매칭 먼저 시도
        let partConfig = meshToPartMap.get(child.name);

        // 정확한 매칭이 없으면 부분 문자열 매칭 시도
        if (!partConfig) {
          for (const [meshName, config] of meshToPartMap.entries()) {
            if (child.name.includes(meshName) || meshName.includes(child.name)) {
              partConfig = config;
              console.log(`  -> 부분 매칭: "${child.name}" ~ "${meshName}"`);
              break;
            }
          }
        }

        if (partConfig) {
          console.log(`  -> Matched: ${partConfig.id}`);

          // 월드 변환 가져오기
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          const worldScale = new THREE.Vector3();

          child.getWorldPosition(worldPosition);
          child.getWorldQuaternion(worldQuaternion);
          child.getWorldScale(worldScale);

          console.log(`  -> World position: [${worldPosition.x.toFixed(2)}, ${worldPosition.y.toFixed(2)}, ${worldPosition.z.toFixed(2)}]`);

          extracted.push({
            geometry: child.geometry,
            material: child.material as THREE.Material,
            worldPosition: worldPosition.clone(),
            worldQuaternion: worldQuaternion.clone(),
            worldScale: worldScale.clone(),
            partConfig,
          });
        } else {
          console.log(`  -> No matching config`);
        }
      }
    });

    console.log(`=== 총 ${extracted.length}개 메시 추출됨 ===`);
    console.log(`=== 발견된 모든 메시 이름: ${allMeshNames.join(', ')} ===`);
    setExtractedMeshes(extracted);

    // Debug callback
    if (onDebugInfo) {
      onDebugInfo({
        meshCount: extracted.length,
        partIds: extracted.map(e => e.partConfig.id),
        allMeshNames,
      });
    }
  }, [scene, meshToPartMap, onDebugInfo]);

  const modelScale = model.scale || 1;

  return (
    <group scale={[modelScale, modelScale, modelScale]}>
      {extractedMeshes.map((meshData, index) => {
        const { partConfig } = meshData;
        const isVisible = visibleParts.length === 0 || visibleParts.includes(partConfig.id);
        const isSelected = selectedPartId === partConfig.id;
        const isHovered = hoveredPartId === partConfig.id;

        return (
          <PartMesh
            key={`${partConfig.id}-${index}`}
            meshData={meshData}
            explodeValue={explodeValue}
            isSelected={isSelected}
            isHovered={isHovered}
            isVisible={isVisible}
            onClick={() => onSelectPart(partConfig.id)}
            onPointerOver={() => onHoverPart(partConfig.id)}
            onPointerOut={() => onHoverPart(null)}
          />
        );
      })}
    </group>
  );
}

// 전체 뷰어 컴포넌트 (Canvas 포함)
interface CombinedModelViewerProps {
  model: CombinedModelConfig;
  explodeValue: number;
  selectedPartId: string | null;
  hoveredPartId: string | null;
  visibleParts: string[];
  onSelectPart: (partId: string | null) => void;
  onHoverPart: (partId: string | null) => void;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  isDarkMode?: boolean;
  onCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
}

// 카메라 위치/타겟을 prop 변경에 따라 동적으로 업데이트
function CameraSync({
  position,
  target,
  onCameraChange,
}: {
  position: [number, number, number];
  target: [number, number, number];
  onCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
}) {
  const { camera, controls } = useThree();
  const isFirstRender = useRef(true);
  const lastReportedPosition = useRef<string>('');

  useEffect(() => {
    // 첫 렌더링 시에는 Canvas 초기화가 처리하므로 스킵
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    camera.position.set(...position);
    if (controls && 'target' in controls) {
      (controls as unknown as { target: THREE.Vector3; update: () => void }).target.set(...target);
      (controls as unknown as { update: () => void }).update();
    }
  }, [position, target, camera, controls]);

  // 카메라 변경 감지 및 콜백 호출
  useEffect(() => {
    if (!onCameraChange || !controls) return;

    const orbitControls = controls as unknown as {
      target: THREE.Vector3;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    };

    const handleChange = () => {
      const pos: [number, number, number] = [
        Math.round(camera.position.x * 100) / 100,
        Math.round(camera.position.y * 100) / 100,
        Math.round(camera.position.z * 100) / 100,
      ];
      const tgt: [number, number, number] = [
        Math.round(orbitControls.target.x * 100) / 100,
        Math.round(orbitControls.target.y * 100) / 100,
        Math.round(orbitControls.target.z * 100) / 100,
      ];

      // 동일한 값이면 스킵
      const key = `${pos.join(',')}_${tgt.join(',')}`;
      if (key === lastReportedPosition.current) return;
      lastReportedPosition.current = key;

      onCameraChange(pos, tgt);
    };

    orbitControls.addEventListener('end', handleChange);
    return () => {
      orbitControls.removeEventListener('end', handleChange);
    };
  }, [camera, controls, onCameraChange]);

  return null;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

export function CombinedModelViewer({
  model,
  explodeValue,
  selectedPartId,
  hoveredPartId,
  visibleParts,
  onSelectPart,
  onHoverPart,
  cameraPosition,
  cameraTarget,
  isDarkMode = true,
  onCameraChange,
}: CombinedModelViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const bgColor = isDarkMode ? '#111' : '#f5f5f5';
  const gradientFrom = isDarkMode ? 'from-gray-900' : 'from-gray-100';
  const gradientTo = isDarkMode ? 'to-gray-950' : 'to-gray-200';
  const finalCameraPosition = cameraPosition || model.cameraPosition || [5, 3, 5];
  const finalCameraTarget = cameraTarget || model.cameraTarget || [0, 0, 0];

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
        onPointerMissed={() => onSelectPart(null)}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 10, 50]} />

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

        {/* 통합 GLB 뷰어 */}
        <Suspense fallback={<LoadingFallback />}>
          <CombinedGLBViewer
            model={model}
            explodeValue={explodeValue}
            selectedPartId={selectedPartId}
            hoveredPartId={hoveredPartId}
            visibleParts={visibleParts}
            onSelectPart={onSelectPart}
            onHoverPart={onHoverPart}
          />
        </Suspense>

        {/* 좌표축 */}
        <axesHelper args={[1]} />

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
          target={finalCameraTarget}
        />

        {/* 카메라 위치 동기화 (prop 변경 시) */}
        <CameraSync position={finalCameraPosition} target={finalCameraTarget} onCameraChange={onCameraChange} />
      </Canvas>
    </div>
  );
}
