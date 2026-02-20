'use client';

import { useRef, useMemo, useEffect, useState, useCallback, Suspense, memo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '@/lib/store/viewerStore';
import type { CrossSectionAxis, CrossSectionState } from '@/types/viewer';
import { AnnotationPins } from '@/components/annotation/AnnotationPins';
import { MeasurementOverlay } from '@/components/viewer/MeasurementOverlay';
import SmoothZoom from '@/components/common/SmoothZoom';

// 단면도 절단면 채색 (Cap Plane)
function CapPlane({
  crossSection,
  boundsMin,
  boundsMax,
  isDarkMode,
}: {
  crossSection: CrossSectionState;
  boundsMin: THREE.Vector3;
  boundsMax: THREE.Vector3;
  isDarkMode: boolean;
}) {
  if (!crossSection.crossSectionEnabled) return null;

  const { crossSectionAxis: axis, crossSectionOffset: offset, crossSectionFlipped: flipped } = crossSection;

  // 절단 위치 계산
  const worldOffset = boundsMin[axis] + offset * (boundsMax[axis] - boundsMin[axis]);

  // 평면 크기: 모델 바운딩박스 기반
  const sizeMap = {
    x: [boundsMax.z - boundsMin.z + 0.2, boundsMax.y - boundsMin.y + 0.2] as [number, number],
    y: [boundsMax.x - boundsMin.x + 0.2, boundsMax.z - boundsMin.z + 0.2] as [number, number],
    z: [boundsMax.x - boundsMin.x + 0.2, boundsMax.y - boundsMin.y + 0.2] as [number, number],
  };
  const size = sizeMap[axis];

  // 위치
  const center: [number, number, number] = [
    axis === 'x' ? worldOffset : (boundsMin.x + boundsMax.x) / 2,
    axis === 'y' ? worldOffset : (boundsMin.y + boundsMax.y) / 2,
    axis === 'z' ? worldOffset : (boundsMin.z + boundsMax.z) / 2,
  ];

  // 회전: 축에 따라 평면을 회전
  const rotation: [number, number, number] = axis === 'x'
    ? [0, Math.PI / 2, 0]
    : axis === 'y'
    ? [-Math.PI / 2, 0, 0]
    : [0, 0, 0];

  return (
    <mesh position={center} rotation={rotation} renderOrder={1}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={isDarkMode ? '#444444' : '#D0D0D0'}
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// 단면도 클리핑 플레인 생성
function buildClippingPlane(
  axis: CrossSectionAxis,
  offset: number,
  flipped: boolean,
  boundsMin: number,
  boundsMax: number,
): THREE.Plane {
  const worldOffset = boundsMin + offset * (boundsMax - boundsMin);
  const sign = flipped ? 1 : -1;
  const normal = new THREE.Vector3(
    axis === 'x' ? sign : 0,
    axis === 'y' ? sign : 0,
    axis === 'z' ? sign : 0,
  );
  const planePoint = new THREE.Vector3(
    axis === 'x' ? worldOffset : 0,
    axis === 'y' ? worldOffset : 0,
    axis === 'z' ? worldOffset : 0,
  );
  return new THREE.Plane(normal, -normal.dot(planePoint));
}

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
  isPlacingPin?: boolean;
  onPlacePin?: (point: [number, number, number], partId?: string) => void;
  focusedPartId?: string | null;
  onMeshPositions?: (positions: Record<string, [number, number, number]>) => void;
  onMeshBounds?: (bounds: Record<string, { center: [number, number, number]; size: [number, number, number] }>) => void;
  globalOpacity?: number;
  // 핀 드래그 이동
  isDraggingPin?: boolean;
  onDragMove?: (point: [number, number, number], partId?: string) => void;
  // 조립 순서 애니메이션: 부품별 개별 분해값
  partExplodeOverrides?: Record<string, number>;
  // 측정 모드
  onMeasurementClick?: (point: [number, number, number]) => void;
  measurementMode?: boolean;
  isDarkMode?: boolean;
  // 고장 진단 하이라이트
  faultHighlights?: Record<string, 'fault' | 'affected'>;
}

// Individual part mesh component
const PartMesh = memo(function PartMesh({
  meshData,
  explodeValue,
  isSelected,
  isHovered,
  isVisible,
  opacity = 1,
  onClick,
  onClickWithPoint,
  onPointerOver,
  onPointerOut,
  onPointerMoveWithPoint,
  modelBoundsMin,
  modelBoundsMax,
  faultStatus,
}: {
  meshData: ExtractedMeshData;
  explodeValue: number;
  isSelected: boolean;
  isHovered: boolean;
  isVisible: boolean;
  opacity?: number;
  onClick: () => void;
  onClickWithPoint?: (point: [number, number, number]) => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onPointerMoveWithPoint?: (point: [number, number, number]) => void;
  modelBoundsMin?: THREE.Vector3;
  modelBoundsMax?: THREE.Vector3;
  faultStatus?: 'fault' | 'affected' | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { worldPosition, worldQuaternion, worldScale, partConfig, geometry, material } = meshData;

  // 콜백을 ref로 유지하여 memo 비교에서 제외해도 최신 콜백 사용
  const onClickRef = useRef(onClick);
  const onClickWithPointRef = useRef(onClickWithPoint);
  const onPointerOverRef = useRef(onPointerOver);
  const onPointerOutRef = useRef(onPointerOut);
  const onPointerMoveWithPointRef = useRef(onPointerMoveWithPoint);
  onClickRef.current = onClick;
  onClickWithPointRef.current = onClickWithPoint;
  onPointerOverRef.current = onPointerOver;
  onPointerOutRef.current = onPointerOut;
  onPointerMoveWithPointRef.current = onPointerMoveWithPoint;

  // Calculate target exploded position
  const [dx, dy, dz] = partConfig.explodeDirection;
  const dist = partConfig.explodeDistance * explodeValue;

  const targetPosition = useRef<[number, number, number]>([
    worldPosition.x + dx * dist,
    worldPosition.y + dy * dist,
    worldPosition.z + dz * dist,
  ]);
  targetPosition.current = [
    worldPosition.x + dx * dist,
    worldPosition.y + dy * dist,
    worldPosition.z + dz * dist,
  ];

  // Smooth lerp toward target position
  const posInitialized = useRef(false);
  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    const p = meshRef.current.position;
    const t = targetPosition.current;
    if (!posInitialized.current) {
      p.set(t[0], t[1], t[2]);
      posInitialized.current = true;
      return;
    }
    const lerpSpeed = 1 - Math.pow(0.001, delta);
    p.x = THREE.MathUtils.lerp(p.x, t[0], lerpSpeed);
    p.y = THREE.MathUtils.lerp(p.y, t[1], lerpSpeed);
    p.z = THREE.MathUtils.lerp(p.z, t[2], lerpSpeed);
  });

  // Create material with base color from config
  const clonedMaterial = useMemo(() => {
    const isTransparent = opacity < 1;
    const mat = new THREE.MeshStandardMaterial({
      color: partConfig.color || '#888888',
      metalness: 0.3,
      roughness: 0.6,
      transparent: isTransparent,
      opacity: opacity,
      depthWrite: !isTransparent,
    });
    return mat;
  }, [partConfig.color, opacity]);

  // X-Ray 모드 & 단면도 상태 구독
  const xRayMode = useViewerStore((s) => s.xRayMode);
  const crossSection = useViewerStore((s) => s.crossSection);

  useEffect(() => {
    const mat = clonedMaterial as THREE.MeshStandardMaterial;
    if (!crossSection.crossSectionEnabled || !modelBoundsMin || !modelBoundsMax) {
      mat.clippingPlanes = [];
      mat.needsUpdate = true;
      return;
    }
    const axis = crossSection.crossSectionAxis;
    const plane = buildClippingPlane(
      axis,
      crossSection.crossSectionOffset,
      crossSection.crossSectionFlipped,
      modelBoundsMin[axis],
      modelBoundsMax[axis],
    );
    mat.clippingPlanes = [plane];
    mat.clipShadows = true;
    mat.needsUpdate = true;
  }, [crossSection, clonedMaterial, modelBoundsMin, modelBoundsMax]);

  // Update emissive for highlight (faultStatus takes priority)
  useEffect(() => {
    const mat = clonedMaterial as THREE.MeshStandardMaterial;
    if (mat && mat.emissive) {
      if (faultStatus === 'fault') {
        mat.emissive.setHex(0xff0000);
        mat.emissiveIntensity = 0.7;
      } else if (faultStatus === 'affected') {
        mat.emissive.setHex(0xff8800);
        mat.emissiveIntensity = 0.5;
      } else if (isSelected) {
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
  }, [clonedMaterial, isSelected, isHovered, faultStatus]);

  // X-Ray 모드: 선택/호버 부품만 불투명, 나머지 와이어프레임
  useEffect(() => {
    const mat = clonedMaterial as THREE.MeshStandardMaterial;
    if (!xRayMode) {
      mat.wireframe = false;
      const isTransparent = opacity < 1;
      mat.transparent = isTransparent;
      mat.opacity = opacity;
      mat.depthWrite = !isTransparent;
      mat.needsUpdate = true;
      return;
    }
    if (isSelected || isHovered) {
      mat.wireframe = false;
      mat.transparent = false;
      mat.opacity = 1;
      mat.depthWrite = true;
    } else {
      mat.wireframe = true;
      mat.transparent = true;
      mat.opacity = 0.15;
      mat.depthWrite = false;
    }
    mat.needsUpdate = true;
  }, [clonedMaterial, xRayMode, isSelected, isHovered, opacity]);

  if (!isVisible || opacity <= 0.01) return null;

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
      quaternion={quaternionArray}
      scale={scaleArray}
      castShadow={opacity > 0.5}
      receiveShadow={opacity > 0.5}
      onClick={(e) => {
        e.stopPropagation();
        if (onClickWithPointRef.current) {
          const p = e.point;
          onClickWithPointRef.current([p.x, p.y, p.z]);
        } else {
          onClickRef.current();
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOverRef.current();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOutRef.current();
      }}
      onPointerMove={
        onPointerMoveWithPoint
          ? (e) => {
              e.stopPropagation();
              const p = e.point;
              onPointerMoveWithPointRef.current?.([p.x, p.y, p.z]);
            }
          : undefined
      }
    />
  );
}, (prev, next) => {
  // 시각적 상태가 동일하면 리렌더링 스킵 (콜백 변경 무시)
  return (
    prev.meshData === next.meshData &&
    prev.explodeValue === next.explodeValue &&
    prev.isSelected === next.isSelected &&
    prev.isHovered === next.isHovered &&
    prev.isVisible === next.isVisible &&
    prev.opacity === next.opacity &&
    prev.modelBoundsMin === next.modelBoundsMin &&
    prev.modelBoundsMax === next.modelBoundsMax &&
    prev.faultStatus === next.faultStatus
  );
});

export function CombinedGLBViewer({
  model,
  explodeValue,
  selectedPartId,
  hoveredPartId,
  visibleParts,
  onSelectPart,
  onHoverPart,
  onDebugInfo,
  isPlacingPin = false,
  onPlacePin,
  focusedPartId,
  onMeshPositions,
  onMeshBounds,
  globalOpacity = 1,
  isDraggingPin = false,
  onDragMove,
  partExplodeOverrides,
  onMeasurementClick,
  measurementMode = false,
  isDarkMode = false,
  faultHighlights,
}: CombinedGLBViewerProps) {
  const { scene } = useGLTF(model.glbPath);
  const [extractedMeshes, setExtractedMeshes] = useState<ExtractedMeshData[]>([]);
  const [boundsMin, setBoundsMin] = useState<THREE.Vector3 | null>(null);
  const [boundsMax, setBoundsMax] = useState<THREE.Vector3 | null>(null);

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

    // 씬의 월드 행렬 업데이트
    scene.updateMatrixWorld(true);

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        allMeshNames.push(child.name || '(unnamed)');

        // 정확한 매칭 먼저 시도
        let partConfig = meshToPartMap.get(child.name);

        // 정확한 매칭이 없으면 부분 문자열 매칭 시도
        if (!partConfig) {
          for (const [meshName, config] of meshToPartMap.entries()) {
            if (child.name.includes(meshName) || meshName.includes(child.name)) {
              partConfig = config;
              break;
            }
          }
        }

        if (partConfig) {
          // 월드 변환 가져오기
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          const worldScale = new THREE.Vector3();

          child.getWorldPosition(worldPosition);
          child.getWorldQuaternion(worldQuaternion);
          child.getWorldScale(worldScale);

          extracted.push({
            geometry: child.geometry,
            material: child.material as THREE.Material,
            worldPosition: worldPosition.clone(),
            worldQuaternion: worldQuaternion.clone(),
            worldScale: worldScale.clone(),
            partConfig,
          });
        }
      }
    });

    setExtractedMeshes(extracted);

    // 단면도용 바운딩박스 계산
    if (extracted.length > 0) {
      const box = new THREE.Box3();
      extracted.forEach((e) => {
        const geomBox = new THREE.Box3().setFromBufferAttribute(
          e.geometry.attributes.position as THREE.BufferAttribute,
        );
        geomBox.applyMatrix4(
          new THREE.Matrix4().compose(e.worldPosition, e.worldQuaternion, e.worldScale),
        );
        box.union(geomBox);
      });
      box.expandByScalar(0.1);
      setBoundsMin(box.min.clone());
      setBoundsMax(box.max.clone());
    }

    // Debug callback
    if (onDebugInfo) {
      onDebugInfo({
        meshCount: extracted.length,
        partIds: extracted.map(e => e.partConfig.id),
        allMeshNames,
      });
    }

    // 부품 위치 콜백
    if (onMeshPositions) {
      const positions: Record<string, [number, number, number]> = {};
      extracted.forEach((e) => {
        positions[e.partConfig.id] = [
          e.worldPosition.x,
          e.worldPosition.y,
          e.worldPosition.z,
        ];
      });
      onMeshPositions(positions);
    }

    // 부품별 바운딩박스 콜백 (자동 포커스용)
    if (onMeshBounds) {
      const bounds: Record<string, { center: [number, number, number]; size: [number, number, number] }> = {};
      extracted.forEach((e) => {
        const geomBox = new THREE.Box3().setFromBufferAttribute(
          e.geometry.attributes.position as THREE.BufferAttribute,
        );
        geomBox.applyMatrix4(
          new THREE.Matrix4().compose(e.worldPosition, e.worldQuaternion, e.worldScale),
        );
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        geomBox.getCenter(center);
        geomBox.getSize(size);
        bounds[e.partConfig.id] = {
          center: [center.x, center.y, center.z],
          size: [size.x, size.y, size.z],
        };
      });
      onMeshBounds(bounds);
    }
  }, [scene, meshToPartMap, onDebugInfo, onMeshPositions, onMeshBounds]);

  const modelScale = model.scale || 1;
  const crossSection = useViewerStore((s) => s.crossSection);

  return (
    <group scale={[modelScale, modelScale, modelScale]}>
      {/* 단면도 절단면 채색 (Cap Plane) */}
      {boundsMin && boundsMax && (
        <CapPlane crossSection={crossSection} boundsMin={boundsMin} boundsMax={boundsMax} isDarkMode={isDarkMode} />
      )}
      {extractedMeshes.map((meshData, index) => {
        const { partConfig } = meshData;
        const isVisible = visibleParts.includes(partConfig.id);
        const isSelected = selectedPartId === partConfig.id;
        const isHovered = hoveredPartId === partConfig.id;
        const opacity = focusedPartId
          ? (focusedPartId === partConfig.id ? globalOpacity : Math.min(0.15, globalOpacity))
          : globalOpacity;
        // 조립 순서 애니메이션: 개별 분해값 오버라이드
        const effectiveExplodeValue = partExplodeOverrides?.[partConfig.id] ?? explodeValue;
        const faultStatus = faultHighlights?.[partConfig.id] ?? null;

        return (
          <PartMesh
            key={`${partConfig.id}-${index}`}
            meshData={meshData}
            explodeValue={effectiveExplodeValue}
            isSelected={isSelected}
            isHovered={isHovered}
            isVisible={isVisible}
            opacity={opacity}
            modelBoundsMin={boundsMin ?? undefined}
            modelBoundsMax={boundsMax ?? undefined}
            faultStatus={faultStatus}
            onClick={() => onSelectPart(partConfig.id)}
            onClickWithPoint={
              measurementMode && onMeasurementClick
                ? (point) => {
                    onMeasurementClick(point);
                  }
                : isPlacingPin && onPlacePin
                ? (point) => {
                    // 핀 배치 모드: 모델 스케일 보정 + 분해 오프셋 제거 (비분해 좌표로 저장)
                    const scale = model.scale || 1;
                    const [dx, dy, dz] = partConfig.explodeDirection;
                    const dist = partConfig.explodeDistance * explodeValue;
                    onPlacePin(
                      [
                        point[0] / scale - dx * dist,
                        point[1] / scale - dy * dist,
                        point[2] / scale - dz * dist,
                      ],
                      partConfig.id
                    );
                  }
                : undefined
            }
            onPointerOver={() => onHoverPart(partConfig.id)}
            onPointerOut={() => onHoverPart(null)}
            onPointerMoveWithPoint={
              isDraggingPin && onDragMove
                ? (point) => {
                    const scale = model.scale || 1;
                    const [dx, dy, dz] = partConfig.explodeDirection;
                    const dist = partConfig.explodeDistance * explodeValue;
                    onDragMove(
                      [
                        point[0] / scale - dx * dist,
                        point[1] / scale - dy * dist,
                        point[2] / scale - dz * dist,
                      ],
                      partConfig.id
                    );
                  }
                : undefined
            }
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
  // 주석 관련 props
  annotations?: import('@/types/annotation').AnnotationRow[];
  activeAnnotationId?: string | null;
  showAllAnnotations?: boolean;
  isPlacingPin?: boolean;
  onPlacePin?: (point: [number, number, number], partId?: string) => void;
  onAnnotationPinClick?: (id: string) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  // 부품 트리 탐색기 관련
  focusedPartId?: string | null;
  onMeshPositions?: (positions: Record<string, [number, number, number]>) => void;
  onMeshBounds?: (bounds: Record<string, { center: [number, number, number]; size: [number, number, number] }>) => void;
  // 투명도
  globalOpacity?: number;
  // 핀 드래그 이동
  isDraggingPin?: boolean;
  onDragMove?: (point: [number, number, number], partId?: string) => void;
  draggingAnnotationId?: string | null;
  dragPreviewPosition?: [number, number, number] | null;
  dragTargetInfo?: { targetType: 'part' | 'coordinate'; partId?: string } | null;
  onDragStart?: (id: string) => void;
  // 조립 순서 애니메이션
  partExplodeOverrides?: Record<string, number>;
  // 측정 도구
  onMeasurementClick?: (point: [number, number, number]) => void;
  measurementMode?: boolean;
  measurements?: { pointA: [number, number, number]; pointB: [number, number, number]; distance: number }[];
  pendingMeasurePoint?: [number, number, number] | null;
  // 고장 진단 하이라이트
  faultHighlights?: Record<string, 'fault' | 'affected'>;
}

// SmoothZoom은 @/components/common/SmoothZoom에서 import

// 카메라 위치/타겟을 prop 변경에 따라 부드럽게 업데이트 (lerp)
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
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetTgt = useRef(new THREE.Vector3(...target));
  const isLerping = useRef(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      targetPos.current.set(...position);
      targetTgt.current.set(...target);
      return;
    }
    targetPos.current.set(...position);
    targetTgt.current.set(...target);
    isLerping.current = true;
  }, [position, target]);

  // 부드러운 카메라 이동 (lerp)
  useFrame(() => {
    if (!isLerping.current) return;

    const factor = 0.08;
    camera.position.lerp(targetPos.current, factor);

    if (controls && 'target' in controls) {
      const orbitTarget = (controls as unknown as { target: THREE.Vector3 }).target;
      orbitTarget.lerp(targetTgt.current, factor);
      (controls as unknown as { update: () => void }).update();
    }

    // 충분히 가까우면 lerp 중단
    const posDist = camera.position.distanceTo(targetPos.current);
    const tgtDist = controls && 'target' in controls
      ? (controls as unknown as { target: THREE.Vector3 }).target.distanceTo(targetTgt.current)
      : 0;
    if (posDist < 0.005 && tgtDist < 0.005) {
      camera.position.copy(targetPos.current);
      if (controls && 'target' in controls) {
        (controls as unknown as { target: THREE.Vector3 }).target.copy(targetTgt.current);
        (controls as unknown as { update: () => void }).update();
      }
      isLerping.current = false;
    }
  });

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
  isDarkMode = false,
  onCameraChange,
  annotations,
  activeAnnotationId,
  showAllAnnotations,
  isPlacingPin = false,
  onPlacePin,
  onAnnotationPinClick,
  containerRef,
  focusedPartId,
  onMeshPositions,
  onMeshBounds,
  globalOpacity,
  isDraggingPin = false,
  onDragMove,
  draggingAnnotationId,
  dragPreviewPosition,
  dragTargetInfo,
  onDragStart,
  partExplodeOverrides,
  onMeasurementClick,
  measurementMode = false,
  measurements,
  pendingMeasurePoint,
  faultHighlights,
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
    <div ref={containerRef} className={`w-full h-full bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-lg overflow-hidden relative`} style={isDraggingPin ? { cursor: 'grabbing' } : isPlacingPin ? { cursor: 'crosshair' } : measurementMode ? { cursor: 'crosshair' } : undefined}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: finalCameraPosition,
          fov: 50,
          near: 0.01,
          far: 100,
        }}
        onPointerMissed={() => { if (!isPlacingPin) onSelectPart(null); }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          localClippingEnabled: true,
        }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 10, 50]} />

        {/* 조명 */}
        <ambientLight intensity={isDarkMode ? 1.2 : 1.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={isDarkMode ? 1.5 : 1.8}
          castShadow={(globalOpacity ?? 1) > 0.5}
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
            isPlacingPin={isPlacingPin}
            onPlacePin={onPlacePin}
            focusedPartId={focusedPartId}
            onMeshPositions={onMeshPositions}
            onMeshBounds={onMeshBounds}
            globalOpacity={globalOpacity}
            isDraggingPin={isDraggingPin}
            onDragMove={onDragMove}
            partExplodeOverrides={partExplodeOverrides}
            onMeasurementClick={onMeasurementClick}
            measurementMode={measurementMode}
            isDarkMode={isDarkMode}
            faultHighlights={faultHighlights}
          />
        </Suspense>

        {/* 주석 핀 */}
        {annotations && (annotations.length > 0 || draggingAnnotationId) && onAnnotationPinClick && (
          <AnnotationPins
            annotations={annotations}
            activeAnnotationId={activeAnnotationId ?? null}
            showAllAnnotations={showAllAnnotations}
            explodeValue={explodeValue}
            parts={model.parts}
            modelScale={model.scale || 1}
            onPinClick={onAnnotationPinClick}
            draggingAnnotationId={draggingAnnotationId}
            dragPreviewPosition={dragPreviewPosition}
            dragTargetInfo={dragTargetInfo}
            onDragStart={onDragStart}
            isPlacingPin={isPlacingPin}
          />
        )}

        {/* 측정 도구 오버레이 */}
        {(measurements || pendingMeasurePoint) && (
          <MeasurementOverlay
            measurements={measurements ?? []}
            pendingPoint={pendingMeasurePoint ?? null}
            modelScale={model.scale || 1}
          />
        )}

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
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, 0]}
          receiveShadow={(globalOpacity ?? 1) > 0.5}
          onClick={
            isPlacingPin && onPlacePin
              ? (e) => {
                  e.stopPropagation();
                  const p = e.point;
                  onPlacePin([p.x, p.y, p.z]);
                }
              : undefined
          }
          onPointerMove={
            isDraggingPin && onDragMove
              ? (e) => {
                  e.stopPropagation();
                  const p = e.point;
                  onDragMove([p.x, p.y, p.z]);
                }
              : undefined
          }
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color={isDarkMode ? '#1a1a1a' : '#e8e8e8'}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* 드래그 중 투명 캡처 평면 (메시 사이 빈 공간에서도 좌표 추적) */}
        {isDraggingPin && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.5, 0]}
            visible={false}
            onPointerMove={(e) => {
              if (onDragMove) {
                const p = e.point;
                onDragMove([p.x, p.y, p.z]);
              }
            }}
          >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {/* 카메라 컨트롤 */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          enableZoom={false}
          target={finalCameraTarget}
          enabled={!isDraggingPin}
        />
        <SmoothZoom />

        {/* 카메라 위치 동기화 (prop 변경 시) */}
        <CameraSync position={finalCameraPosition} target={finalCameraTarget} onCameraChange={onCameraChange} />
      </Canvas>
    </div>
  );
}
