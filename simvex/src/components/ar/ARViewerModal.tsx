'use client';

import { useState, useRef, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { createXRStore, XR, useXRHitTest } from '@react-three/xr';
import { Matrix4 } from 'three';
import type { CombinedPartConfig } from '@/components/viewer/CombinedGLBPart';

// @react-three/xr v6이 모든 material.onBuild()를 null 체크 없이 호출하는 버그 워크어라운드
// 프로토타입에 한 번만 패치해 모든 Three.js 재질(JSX 포함)에 적용
if (typeof (THREE.Material.prototype as any).onBuild !== 'function') {
  (THREE.Material.prototype as any).onBuild = () => {};
}

// 모듈 레벨 싱글톤 스토어 — 컴포넌트 리렌더에 재생성 방지
const store = createXRStore();

export interface ARViewerModalProps {
  glbPath: string;
  scale: number;
  parts: CombinedPartConfig[];
  explodeValue: number;
  onClose: () => void;
}

// ─── 배치 가이드 레티클 ───────────────────────────────────────────
function HitTestReticle({
  placed,
  hitPosRef,
  hasHitRef,
}: {
  placed: boolean;
  hitPosRef: React.MutableRefObject<THREE.Vector3>;
  hasHitRef: React.MutableRefObject<boolean>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matrixHelper = useRef(new Matrix4());

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (placed || !meshRef.current || results.length === 0) return;
      getWorldMatrix(matrixHelper.current, results[0]);
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      matrixHelper.current.decompose(pos, quat, scale);
      meshRef.current.position.copy(pos);
      meshRef.current.quaternion.copy(quat);
      meshRef.current.visible = true;
      hitPosRef.current.copy(pos);
      hasHitRef.current = true;
    },
    'viewer',
  );

  if (placed) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#4466ff" side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── 개별 부품 메시 ───────────────────────────────────────────────
interface ARPartData {
  id: string;
  geometry: THREE.BufferGeometry;
  worldPos: THREE.Vector3;
  worldQuat: THREE.Quaternion;
  worldScale: THREE.Vector3;
  explodeDirection: [number, number, number];
  explodeDistance: number;
  color?: string;
}

function ARPartMesh({
  data,
  explodeValue,
}: {
  data: ARPartData;
  explodeValue: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: data.color || '#888888',
      metalness: 0.3,
      roughness: 0.6,
    });
    // @react-three/xr v6이 XR 세션 중 material.onBuild()를 null 체크 없이 호출하는 버그 워크어라운드
    (mat as any).onBuild = () => {};
    return mat;
  }, [data.color]);

  useFrame(() => {
    if (!meshRef.current) return;
    const [dx, dy, dz] = data.explodeDirection;
    const dist = data.explodeDistance * explodeValue;
    const tx = data.worldPos.x + dx * dist;
    const ty = data.worldPos.y + dy * dist;
    const tz = data.worldPos.z + dz * dist;
    const p = meshRef.current.position;
    p.x = THREE.MathUtils.lerp(p.x, tx, 0.15);
    p.y = THREE.MathUtils.lerp(p.y, ty, 0.15);
    p.z = THREE.MathUtils.lerp(p.z, tz, 0.15);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={data.geometry}
      material={material}
      quaternion={
        [data.worldQuat.x, data.worldQuat.y, data.worldQuat.z, data.worldQuat.w] as [
          number,
          number,
          number,
          number,
        ]
      }
      scale={[data.worldScale.x, data.worldScale.y, data.worldScale.z] as [number, number, number]}
      position={[data.worldPos.x, data.worldPos.y, data.worldPos.z]}
    />
  );
}

// ─── AR 모델 (GLB 로드 + 분해 애니메이션) ─────────────────────────
function ARModel({
  glbPath,
  scale: modelScale,
  parts,
  explodeValue,
  placement,
}: {
  glbPath: string;
  scale: number;
  parts: CombinedPartConfig[];
  explodeValue: number;
  placement: THREE.Vector3;
}) {
  const { scene } = useGLTF(glbPath);

  // GLB 씬에서 부품 메시 데이터 추출 (worldPosition 기준)
  const meshDataList = useMemo<ARPartData[]>(() => {
    const result: ARPartData[] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const partCfg = parts.find((p) => p.meshName === node.name);
      if (!partCfg) return;

      const wPos = new THREE.Vector3();
      const wQuat = new THREE.Quaternion();
      const wScale = new THREE.Vector3();
      node.matrixWorld.decompose(wPos, wQuat, wScale);

      result.push({
        id: partCfg.id,
        geometry: node.geometry,
        worldPos: wPos,
        worldQuat: wQuat,
        worldScale: wScale.multiplyScalar(modelScale),
        explodeDirection: partCfg.explodeDirection,
        explodeDistance: partCfg.explodeDistance,
        color: partCfg.color,
      });
    });
    return result;
  }, [scene, parts, modelScale]);

  return (
    <group position={[placement.x, placement.y, placement.z]}>
      {meshDataList.map((data) => (
        <ARPartMesh key={data.id} data={data} explodeValue={explodeValue} />
      ))}
    </group>
  );
}

// ─── 메인 모달 컴포넌트 ───────────────────────────────────────────
export function ARViewerModal({
  glbPath,
  scale,
  parts,
  explodeValue: initialExplodeValue,
  onClose,
}: ARViewerModalProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [arStarted, setArStarted] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [placement, setPlacement] = useState<THREE.Vector3 | null>(null);
  const [explodeValue, setExplodeValue] = useState(initialExplodeValue);

  // hit-test 위치를 3D 컴포넌트와 DOM 버튼이 공유하는 ref
  const hitPosRef = useRef(new THREE.Vector3());
  const hasHitRef = useRef(false);

  // WebXR AR 지원 여부 체크
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.xr) {
      setSupported(false);
      return;
    }
    navigator.xr
      .isSessionSupported('immersive-ar')
      .then(setSupported)
      .catch(() => setSupported(false));
  }, []);

  // 현재 hit-test 위치에 모델 배치
  const handlePlace = useCallback(() => {
    if (!hasHitRef.current) return;
    setPlacement(hitPosRef.current.clone());
    setPlaced(true);
  }, []);

  // AR 세션 시작 (Canvas 마운트 후 enterAR 호출)
  const handleStartAR = useCallback(async () => {
    setArStarted(true);
    // React가 Canvas를 마운트할 시간을 확보
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    await store.enterAR();
  }, []);

  // ── WebXR 지원 확인 중 ──
  if (supported === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-9 h-9 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── WebXR 미지원 (iOS / 데스크탑) ──
  if (!supported) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2">AR 미지원 기기</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            AR 기능은 WebXR을 지원하는
            <br />
            Android Chrome에서 사용 가능합니다.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#001AFF] text-white rounded-xl font-semibold text-[15px]"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  // ── AR 시작 전 안내 모달 ──
  if (!arStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* AR 프레임 아이콘 */}
            <svg
              className="w-7 h-7 text-[#001AFF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9V5.5A2.5 2.5 0 015.5 3H9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 3h3.5A2.5 2.5 0 0121 5.5V9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15v3.5A2.5 2.5 0 005.5 21H9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 21h3.5A2.5 2.5 0 0021 18.5V15"
              />
              <circle cx="12" cy="12" r="2" strokeWidth={2} />
            </svg>
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2">AR로 보기</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            카메라로 바닥이나 테이블을 비춘 후
            <br />
            파란 원이 나타나면 탭하여 모델을 배치하세요.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-[15px]"
            >
              취소
            </button>
            <button
              onClick={handleStartAR}
              className="flex-1 py-3 bg-[#001AFF] text-white rounded-xl font-semibold text-[15px]"
            >
              AR 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── AR 세션 중 ──
  return (
    <>
      {/* 3D Canvas: alpha: true 로 카메라 뷰 투과 */}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
      >
        <XR store={store}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[1, 3, 2]} intensity={2} />

          {/* 배치 가이드 레티클 */}
          <HitTestReticle placed={placed} hitPosRef={hitPosRef} hasHitRef={hasHitRef} />

          {/* 배치 후 3D 모델 */}
          {placed && placement && (
            <Suspense fallback={null}>
              <ARModel
                glbPath={glbPath}
                scale={scale}
                parts={parts}
                explodeValue={explodeValue}
                placement={placement}
              />
            </Suspense>
          )}
        </XR>
      </Canvas>

      {/* DOM 오버레이: AR 세션 중 UI (position: fixed, z-index 최상위) */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-end pointer-events-none"
        style={{ paddingBottom: 40 }}
      >
        <div className="w-full max-w-xs px-5 space-y-3 pointer-events-auto">
          {/* 배치 전: 배치 버튼 */}
          {!placed && (
            <button
              onClick={handlePlace}
              className="w-full py-4 bg-[#001AFF] text-white rounded-2xl font-semibold text-base shadow-lg"
            >
              여기에 배치
            </button>
          )}

          {/* 배치 후: 분해 슬라이더 */}
          {placed && (
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4">
              <div className="text-white text-xs text-center mb-2 font-medium">
                분해도: {Math.round(explodeValue * 100)}%
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explodeValue}
                onChange={(e) => setExplodeValue(parseFloat(e.target.value))}
                className="w-full accent-[#001AFF]"
              />
            </div>
          )}

          {/* AR 종료 버튼 */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-white/20 backdrop-blur-md text-white rounded-2xl font-semibold text-base border border-white/30 shadow-lg"
          >
            AR 종료
          </button>
        </div>
      </div>
    </>
  );
}
