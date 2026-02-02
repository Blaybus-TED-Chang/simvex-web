'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PartConfig } from '@/types/viewer';

interface GLBPartProps {
  part: PartConfig;
  basePath: string;
  explodeValue: number;
  isSelected: boolean;
  isHovered: boolean;
  isVisible: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

export function GLBPart({
  part,
  basePath,
  explodeValue,
  isSelected,
  isHovered,
  isVisible,
  onClick,
  onPointerOver,
  onPointerOut,
}: GLBPartProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(`${basePath}/${part.glbFile}`);

  // 씬 복제 및 머티리얼 설정
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 머티리얼 복제하여 개별 조작 가능하게
        if (child.material) {
          child.material = (child.material as THREE.Material).clone();
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // 현재 위치 계산 (조립 위치 + 분해 오프셋)
  const currentPosition = useMemo((): [number, number, number] => {
    const [ax, ay, az] = part.assemblyPosition;
    const [dx, dy, dz] = part.explodeDirection;
    const dist = part.explodeDistance * explodeValue;
    return [ax + dx * dist, ay + dy * dist, az + dz * dist];
  }, [part, explodeValue]);

  // 하이라이트 효과 - useEffect로 변경 (성능 개선)
  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.emissive) {
          if (isSelected) {
            material.emissive.setHex(0x0066ff);
            material.emissiveIntensity = 0.3;
          } else if (isHovered) {
            material.emissive.setHex(0x00aaff);
            material.emissiveIntensity = 0.15;
          } else {
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [isSelected, isHovered]);

  if (!isVisible) return null;

  return (
    <group
      ref={groupRef}
      position={currentPosition}
      rotation={part.assemblyRotation ? part.assemblyRotation.map((r) => (r * Math.PI) / 180) as [number, number, number] : [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
        document.body.style.cursor = 'auto';
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// GLB 프리로드
export function preloadModel(basePath: string, glbFile: string) {
  useGLTF.preload(`${basePath}/${glbFile}`);
}
