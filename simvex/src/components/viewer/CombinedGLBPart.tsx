'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

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
  glbPath: string;            // 통합 GLB 파일 경로
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

  // Clone material for this instance
  const clonedMaterial = useMemo(() => {
    const mat = material.clone();
    return mat;
  }, [material]);

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

  return (
    <group>
      {extractedMeshes.map((meshData) => {
        const { partConfig } = meshData;
        const isVisible = visibleParts.length === 0 || visibleParts.includes(partConfig.id);
        const isSelected = selectedPartId === partConfig.id;
        const isHovered = hoveredPartId === partConfig.id;

        return (
          <PartMesh
            key={partConfig.id}
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
