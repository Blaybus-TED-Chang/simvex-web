'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { getModelById, getCombinedModelById } from '@/data/models';
import { useViewerStore } from '@/lib/store/viewerStore';
import { ExplodeSlider } from '@/components/viewer/ExplodeSlider';
import { ProductInfo } from '@/components/viewer/ProductInfo';
import { PartInfo } from '@/components/viewer/PartInfo';
import { PartsList } from '@/components/viewer/PartsList';
import { NotesPanel } from '@/components/viewer/NotesPanel';
import { AuthButton } from '@/components/auth/AuthButton';
import { QuizPanel } from '@/components/quiz/QuizPanel';
import { ExportPdfButton } from '@/components/export/ExportPdfButton';
import { useUser } from '@/hooks/useUser';
import { ModelConfig } from '@/types/viewer';
import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';
import { createClient } from '@/lib/supabase/client';
import { userModelToConfig } from '@/types/userModel';
import { getQuizByModelId, hasQuiz } from '@/data/quizzes';
import { Tooltip } from '@/components/ui/Tooltip';
import { ControlsHelp } from '@/components/ui/ControlsHelp';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useAnnotationStore } from '@/lib/store/annotationStore';
import { AnnotationPanel } from '@/components/annotation/AnnotationPanel';
import { usePartCustomizations } from '@/hooks/usePartCustomizations';
import { usePartMemos } from '@/hooks/usePartMemos';
import { PartMemoPanel } from '@/components/viewer/PartMemoPanel';
import { PartTreePanel } from '@/components/viewer/PartTreePanel';
import { ViewerTabs, ViewerTabType } from '@/components/viewer/ViewerTabs';
import { SimulationTabContent } from '@/components/viewer/SimulationTabContent';
import { hasSimulation as checkHasSimulation, hasViewer as checkHasViewer, getSimulationMapping } from '@/data/simulationMapping';
import { getSimulationModelInfo } from '@/data/simulationModelInfo';

// 3D 뷰어는 클라이언트에서만 렌더링
const ModelViewer = dynamic(
  () => import('@/components/viewer/ModelViewer').then((mod) => mod.ModelViewer),
  { ssr: false, loading: () => <ViewerSkeleton /> }
);

// 통합 GLB 뷰어 (Canvas 포함)
const CombinedModelViewer = dynamic(
  () => import('@/components/viewer/CombinedGLBPart').then((mod) => mod.CombinedModelViewer),
  { ssr: false, loading: () => <ViewerSkeleton /> }
);

const VIEWER_CONTROLS_GUIDE = [
  { icon: '🖱️ 좌클릭 드래그', desc: '회전' },
  { icon: '🖱️ 우클릭 드래그', desc: '이동 (팬)' },
  { icon: '🔄 스크롤', desc: '줌 인/아웃' },
  { icon: '👆 부품 클릭', desc: '선택 및 정보 표시' },
];

function ViewerSkeleton() {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">3D 모델 로딩 중...</p>
      </div>
    </div>
  );
}

// 디바운스 훅
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // 항상 최신 콜백을 참조
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

export default function ViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const modelId = params.model as string;
  const { user } = useUser();

  // 사용자 업로드 모델 (u-{uuid} 형식)
  const isUserModel = modelId.startsWith('u-');
  const [userModel, setUserModel] = useState<CombinedModelConfig | null>(null);
  const [userModelLoading, setUserModelLoading] = useState(isUserModel);

  useEffect(() => {
    if (!isUserModel) return;
    const uuid = modelId.slice(2);
    const supabase = createClient();
    supabase
      .from('user_models')
      .select('*')
      .eq('id', uuid)
      .single()
      .then(({ data }) => {
        if (data) {
          const { data: urlData } = supabase.storage
            .from('user-models')
            .getPublicUrl(data.glb_storage_path);
          const config = userModelToConfig(data, urlData.publicUrl);
          setUserModel(config);
        }
        setUserModelLoading(false);
      });
  }, [isUserModel, modelId]);

  // 일반 모델 또는 통합 모델 조회
  const originalModel = isUserModel ? undefined : getModelById(modelId);
  const combinedModel = isUserModel ? userModel : getCombinedModelById(modelId);
  const isCombinedModel = !originalModel && !!combinedModel;

  // 시뮬레이션/뷰어 매핑
  const modelHasSimulation = !isUserModel && checkHasSimulation(modelId);
  const modelHasViewer = checkHasViewer(modelId);
  const simulationMapping = !isUserModel ? getSimulationMapping(modelId) : undefined;
  const simModelInfo = !isUserModel ? getSimulationModelInfo(modelId) : undefined;

  // 탭 바 표시 여부: 사용자 업로드 모델이면 숨김, 그 외 항상 표시
  const showTabs = !isUserModel;

  // 탭 상태: URL 쿼리 파라미터에서 파생
  const tabFromUrl = searchParams.get('tab');
  const activeTab: ViewerTabType = useMemo(() => {
    if (tabFromUrl === 'sim' && modelHasSimulation) return 'simulation';
    if (!modelHasViewer && modelHasSimulation) return 'simulation';
    return 'viewer';
  }, [tabFromUrl, modelHasViewer, modelHasSimulation]);

  const handleTabChange = useCallback((tab: ViewerTabType) => {
    const url = new URL(window.location.href);
    if (tab === 'simulation') {
      url.searchParams.set('tab', 'sim');
    } else {
      url.searchParams.delete('tab');
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  // 시뮬레이션 Learn 패널 상태
  const [showLearning, setShowLearning] = useState(false);

  const {
    selectedPartId,
    setSelectedPartId,
    hoveredPartId,
    setHoveredPartId,
    explodeValue,
    setExplodeValue,
    visibleParts,
    setCurrentModel,
    setAllPartsVisible,
    isDarkMode,
    toggleDarkMode,
    notes,
    getModelState,
    setModelState,
  } = useViewerStore();

  // 조작 가이드 오버레이 (페이지 진입 시 항상 표시)
  const [showControls, setShowControls] = useState(true);

  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
  const [notesPanelWidth, setNotesPanelWidth] = useState(384); // 기본 w-96 = 384px
  const [sidebarWidth, setSidebarWidth] = useState(320); // 기본 w-80 = 320px

  // 부품 트리 패널
  const [isTreePanelOpen, setIsTreePanelOpen] = useState(false);
  const [treePanelWidth, setTreePanelWidth] = useState(280);
  const [focusedPartId, setFocusedPartId] = useState<string | null>(null);
  const [meshPositions, setMeshPositions] = useState<Record<string, [number, number, number]>>({});
  const isTreeResizing = useRef(false);
  const isResizing = useRef(false);
  const isSidebarResizing = useRef(false);

  // 노트 패널 리사이즈 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize;';
    document.body.appendChild(overlay);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setNotesPanelWidth(Math.max(320, Math.min(800, newWidth)));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      overlay.remove();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // 우측 사이드바 리사이즈 핸들러
  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isSidebarResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    // 리사이즈 중 전체 화면 위에 투명 오버레이를 생성하여 3D Canvas 이벤트 차단
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize;';
    document.body.appendChild(overlay);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSidebarResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setSidebarWidth(Math.max(240, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      isSidebarResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      overlay.remove();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // 트리 패널 리사이즈 핸들러
  const handleTreeResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isTreeResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize;';
    document.body.appendChild(overlay);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isTreeResizing.current) return;
      const newWidth = e.clientX;
      setTreePanelWidth(Math.max(200, Math.min(500, newWidth)));
    };

    const handleMouseUp = () => {
      isTreeResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      overlay.remove();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>(
    originalModel?.cameraPosition || combinedModel?.cameraPosition || [5, 3, 5]
  );
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>(
    originalModel?.cameraTarget || combinedModel?.cameraTarget || [0, 0, 0]
  );

  // 일반 모델
  const model: ModelConfig | undefined = originalModel;

  // 현재 모델 정보 (통합 또는 일반)
  const currentModelInfo = useMemo(() => {
    if (isCombinedModel && combinedModel) {
      return {
        id: combinedModel.id,
        name: combinedModel.name,
        nameKo: combinedModel.nameKo,
        description: combinedModel.description,
        theory: combinedModel.theory,
        category: combinedModel.category,
        parts: combinedModel.parts,
      };
    }
    if (model) {
      return {
        id: model.id,
        name: model.name,
        nameKo: model.nameKo,
        description: model.description,
        theory: model.theory,
        category: model.category,
        parts: model.parts,
      };
    }
    return null;
  }, [isCombinedModel, combinedModel, model]);

  // 헤더에 표시할 모델 정보 (시뮬레이션 전용 모델일 때 simModelInfo 사용)
  const headerModelInfo = useMemo(() => {
    if (currentModelInfo) return currentModelInfo;
    if (simModelInfo) return simModelInfo;
    return null;
  }, [currentModelInfo, simModelInfo]);

  // PDF 내보내기용 정보 (현재 활성 탭에 따라)
  const pdfModelInfo = useMemo(() => {
    if (activeTab === 'simulation' && simModelInfo) return simModelInfo;
    if (currentModelInfo) return currentModelInfo;
    if (simModelInfo) return simModelInfo;
    return null;
  }, [activeTab, currentModelInfo, simModelInfo]);

  // 퀴즈 데이터
  const quiz = useMemo(() => {
    if (!currentModelInfo) return undefined;
    return getQuizByModelId(currentModelInfo.id);
  }, [currentModelInfo]);

  const modelHasQuiz = useMemo(() => {
    if (!currentModelInfo) return false;
    return hasQuiz(currentModelInfo.id);
  }, [currentModelInfo]);

  // 퀴즈에서 부품 선택 요청 시 (향후 부품 하이라이트에 사용 가능)
  const handleQuizRequestPartSelect = useCallback((_partId: string) => {
    // TODO: 퀴즈 진행 중 해당 부품 하이라이트 기능 추가 가능
  }, []);

  const handleQuizClearPartSelect = useCallback(() => {
    // TODO: 하이라이트 해제
  }, []);

  // Zustand store hydration (SSR 호환)
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    useViewerStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  // 모델 상태 저장 (디바운스)
  const saveModelStateDebounced = useDebouncedCallback(
    useCallback(
      (pos: [number, number, number], target: [number, number, number]) => {
        if (!currentModelInfo) return;
        setModelState(currentModelInfo.id, {
          cameraPosition: pos,
          cameraTarget: target,
          explodeValue,
          selectedPartId,
        });
      },
      [currentModelInfo, explodeValue, selectedPartId, setModelState]
    ),
    500
  );

  // 모델 초기화 및 저장된 상태 복원
  useEffect(() => {
    // hydration이 완료되지 않았으면 대기
    if (!isHydrated) return;

    const model = originalModel || combinedModel;
    if (!model) return;

    setCurrentModel(model.id);
    setAllPartsVisible(model.parts.map((p) => p.id));

    // 저장된 상태 복원
    const savedState = getModelState(model.id);
    if (savedState) {
      setCameraPosition(savedState.cameraPosition);
      setCameraTarget(savedState.cameraTarget);
      setExplodeValue(savedState.explodeValue);
      if (savedState.selectedPartId) {
        setSelectedPartId(savedState.selectedPartId);
      }
    } else {
      setCameraPosition(model.cameraPosition || [5, 3, 5]);
      setCameraTarget(model.cameraTarget || [0, 0, 0]);
    }

    // 초기화 완료 표시 (다음 프레임에서 저장 활성화)
    requestAnimationFrame(() => {
      isInitializedRef.current = true;
    });
  }, [isHydrated, originalModel, combinedModel, setCurrentModel, setAllPartsVisible, getModelState, setExplodeValue, setSelectedPartId]);

  // explodeValue, selectedPartId 변경 시 저장 (초기화 완료 후에만)
  useEffect(() => {
    if (!currentModelInfo || !isInitializedRef.current) return;
    setModelState(currentModelInfo.id, {
      explodeValue,
      selectedPartId,
    });
  }, [explodeValue, selectedPartId, currentModelInfo, setModelState]);

  // 카메라 업데이트 핸들러
  const handleUpdateCamera = useCallback((position: [number, number, number], target: [number, number, number]) => {
    setCameraPosition(position);
    setCameraTarget(target);
    saveModelStateDebounced(position, target);
  }, [saveModelStateDebounced]);

  // 부품 트리: 포커스 콜백
  const handleFocusPart = useCallback((partId: string | null) => {
    if (partId) {
      setFocusedPartId(partId);
      setSelectedPartId(partId);
      // 카메라를 부품 위치로 줌인
      const pos = meshPositions[partId];
      if (pos) {
        const modelObj = originalModel || combinedModel;
        const scale = (modelObj && 'scale' in modelObj ? (modelObj as CombinedModelConfig).scale : undefined) || 1;
        // explode offset 반영
        const part = modelObj?.parts.find((p) => p.id === partId);
        let tx = pos[0] * scale;
        let ty = pos[1] * scale;
        let tz = pos[2] * scale;
        if (part) {
          const [dx, dy, dz] = part.explodeDirection;
          const dist = part.explodeDistance * explodeValue;
          tx += dx * dist * scale;
          ty += dy * dist * scale;
          tz += dz * dist * scale;
        }
        // 카메라 방향 유지하면서 거리 2.0
        const camDir = [
          cameraPosition[0] - cameraTarget[0],
          cameraPosition[1] - cameraTarget[1],
          cameraPosition[2] - cameraTarget[2],
        ];
        const len = Math.sqrt(camDir[0] ** 2 + camDir[1] ** 2 + camDir[2] ** 2);
        const zoomDist = 2.0;
        const norm = len > 0 ? [camDir[0] / len, camDir[1] / len, camDir[2] / len] : [0, 0.5, 1];
        setCameraTarget([tx, ty, tz]);
        setCameraPosition([
          tx + norm[0] * zoomDist,
          ty + norm[1] * zoomDist,
          tz + norm[2] * zoomDist,
        ]);
      }
    } else {
      setFocusedPartId(null);
      setSelectedPartId(null);
      // 카메라를 기본값으로 복원
      const modelObj = originalModel || combinedModel;
      setCameraPosition(modelObj?.cameraPosition || [5, 3, 5]);
      setCameraTarget(modelObj?.cameraTarget || [0, 0, 0]);
    }
  }, [meshPositions, cameraPosition, cameraTarget, explodeValue, originalModel, combinedModel, setSelectedPartId]);

  // 부품 위치 콜백 (안정적 참조를 위해 useCallback)
  const handleMeshPositions = useCallback((positions: Record<string, [number, number, number]>) => {
    setMeshPositions(positions);
  }, []);

  // === 부품 커스터마이징 ===
  const { customizations, upsertCustomization, resetCustomization } = usePartCustomizations(user, modelId);

  // mergedModel: 원본에 커스터마이징 오버라이드 적용
  const mergedModel = useMemo(() => {
    if (!combinedModel) return null;
    return {
      ...combinedModel,
      parts: combinedModel.parts.map((p) => ({
        ...p,
        color: customizations[p.id]?.color ?? p.color,
        nameKo: customizations[p.id]?.nameKo ?? p.nameKo,
      })),
    };
  }, [combinedModel, customizations]);

  // === 부품 메모 ===
  const { memos, createMemo, deleteMemo, loading: memosLoading } = usePartMemos(user, modelId);
  const [isMemoPanelOpen, setIsMemoPanelOpen] = useState(false);

  // 스크린샷 캡처 함수
  const captureScreenshot = useCallback(async (): Promise<Blob | null> => {
    const container = viewportRef.current;
    if (!container) return null;

    const glCanvas = container.querySelector('canvas') as HTMLCanvasElement | null;
    if (!glCanvas) return null;

    try {
      const dataUrl = glCanvas.toDataURL('image/jpeg', 0.8);
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      console.error('스크린샷 캡처 실패');
      return null;
    }
  }, []);

  // === 주석(Annotation) ===
  const { annotations, createAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations(user, modelId);
  const {
    isPlacingPin,
    isAnnotationPanelOpen,
    setAnnotationPanelOpen,
    activeAnnotationId,
    setActiveAnnotationId,
    pendingAnnotation,
    setPendingAnnotation,
    setPlacingPin,
    showAllAnnotations,
    setShowAllAnnotations,
  } = useAnnotationStore();
  const viewportRef = useRef<HTMLDivElement>(null);

  // 핀 배치 콜백 (3D 뷰어에서 클릭 시)
  const handlePlacePin = useCallback((point: [number, number, number], partId?: string) => {
    setPendingAnnotation({
      position: point,
      targetType: partId ? 'part' : 'coordinate',
      partId,
    });
    setPlacingPin(false);
  }, [setPendingAnnotation, setPlacingPin]);

  // 주석 핀 클릭 콜백
  const handleAnnotationPinClick = useCallback((id: string) => {
    setActiveAnnotationId(activeAnnotationId === id ? null : id);
    if (!isAnnotationPanelOpen) setAnnotationPanelOpen(true);
  }, [activeAnnotationId, isAnnotationPanelOpen, setActiveAnnotationId, setAnnotationPanelOpen]);

  // 부품 선택 시 핀 말풍선 닫기
  const handleSelectPart = useCallback((partId: string | null) => {
    setSelectedPartId(partId);
    setActiveAnnotationId(null);
  }, [setSelectedPartId, setActiveAnnotationId]);

  // 주석 패널 토글
  const handleToggleAnnotationPanel = useCallback(() => {
    const next = !isAnnotationPanelOpen;
    setAnnotationPanelOpen(next);
    if (!next) {
      setPlacingPin(false);
      setPendingAnnotation(null);
      setActiveAnnotationId(null);
    }
  }, [isAnnotationPanelOpen, setAnnotationPanelOpen, setPlacingPin, setPendingAnnotation, setActiveAnnotationId]);

  // 주석 포함 스크린샷 저장
  const handleAnnotationScreenshot = useCallback(async () => {
    const container = viewportRef.current;
    if (!container) return;

    // 모든 주석 표시 상태로 전환
    const wasShowingAll = showAllAnnotations;
    if (!wasShowingAll) {
      setShowAllAnnotations(true);
    }

    // 렌더링 대기 후 캡처
    await new Promise((r) => setTimeout(r, 300));

    try {
      // 1. WebGL 캔버스 가져오기
      const glCanvas = container.querySelector('canvas') as HTMLCanvasElement | null;
      if (!glCanvas) return;

      const w = glCanvas.width;
      const h = glCanvas.height;
      const dpr = window.devicePixelRatio || 1;

      // 2. 출력 캔버스 생성 + 3D 렌더 그리기
      const outCanvas = document.createElement('canvas');
      outCanvas.width = w;
      outCanvas.height = h;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(glCanvas, 0, 0);

      // 3. HTML 오버레이 (drei Html) 의 주석 말풍선 위치/텍스트 읽어 그리기
      const containerRect = container.getBoundingClientRect();
      const tooltips = container.querySelectorAll<HTMLElement>('[data-annotation-pin]');

      tooltips.forEach((pin) => {
        const rect = pin.getBoundingClientRect();
        // 컨테이너 기준 상대 좌표 → 캔버스 좌표
        const cx = (rect.left + rect.width / 2 - containerRect.left) * dpr;
        const cy = (rect.top + rect.height / 2 - containerRect.top) * dpr;

        // 핀 색상
        const pinIcon = pin.querySelector<HTMLElement>('[data-pin-icon]');
        const pinColor = pinIcon?.style.backgroundColor || '#3B82F6';

        // 핀 원 그리기
        const pinR = 12 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, pinR, 0, Math.PI * 2);
        ctx.fillStyle = pinColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();

        // 핀 내부 아이콘 (간단 원)
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // 말풍선 텍스트
        const tooltip = pin.querySelector<HTMLElement>('[data-tooltip-box]');
        if (!tooltip) return;
        const title = tooltip.getAttribute('data-title') || '';
        const content = tooltip.getAttribute('data-content') || '';
        if (!title && !content) return;

        const fontSize = 13 * dpr;
        const titleFontSize = 14 * dpr;
        const padding = 10 * dpr;
        const lineGap = 4 * dpr;
        ctx.font = `bold ${titleFontSize}px -apple-system, sans-serif`;

        // 텍스트 줄 계산
        const lines: { text: string; bold: boolean }[] = [];
        if (title) lines.push({ text: title, bold: true });
        if (content) {
          // content를 40자 단위로 줄바꿈
          const words = content;
          for (let i = 0; i < words.length; i += 40) {
            lines.push({ text: words.slice(i, i + 40), bold: false });
          }
        }

        // 박스 크기 계산
        let maxW = 0;
        lines.forEach((l) => {
          ctx.font = l.bold ? `bold ${titleFontSize}px -apple-system, sans-serif` : `${fontSize}px -apple-system, sans-serif`;
          maxW = Math.max(maxW, ctx.measureText(l.text).width);
        });
        const boxW = maxW + padding * 2;
        const boxH = lines.length * (fontSize + lineGap) + padding * 2;

        // 박스 위치 (핀 위)
        const boxX = cx - boxW / 2;
        const boxY = cy - pinR - 8 * dpr - boxH;

        // 박스 배경
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        const r = 6 * dpr;
        ctx.beginPath();
        ctx.moveTo(boxX + r, boxY);
        ctx.lineTo(boxX + boxW - r, boxY);
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
        ctx.lineTo(boxX + boxW, boxY + boxH - r);
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
        ctx.lineTo(boxX + r, boxY + boxH);
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
        ctx.lineTo(boxX, boxY + r);
        ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
        ctx.closePath();
        ctx.fill();

        // 꼬리 삼각형
        ctx.beginPath();
        ctx.moveTo(cx - 6 * dpr, boxY + boxH);
        ctx.lineTo(cx + 6 * dpr, boxY + boxH);
        ctx.lineTo(cx, boxY + boxH + 6 * dpr);
        ctx.closePath();
        ctx.fill();

        // 텍스트 그리기
        ctx.fillStyle = 'white';
        let textY = boxY + padding + fontSize;
        lines.forEach((l) => {
          ctx.font = l.bold ? `bold ${titleFontSize}px -apple-system, sans-serif` : `${fontSize}px -apple-system, sans-serif`;
          ctx.globalAlpha = l.bold ? 1 : 0.85;
          ctx.fillText(l.text, boxX + padding, textY);
          textY += fontSize + lineGap;
        });
        ctx.globalAlpha = 1;
      });

      // 4. 다운로드
      const link = document.createElement('a');
      link.download = `${modelId}-annotations.png`;
      link.href = outCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('스크린샷 캡처 실패:', err);
    }

    // 원래 상태 복원
    if (!wasShowingAll) {
      setShowAllAnnotations(false);
    }
  }, [modelId, showAllAnnotations, setShowAllAnnotations]);

  // 사용자 모델 로딩 중
  if (userModelLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">모델 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 모델이 없고 시뮬레이션도 없으면 에러 페이지
  if (!headerModelInfo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">모델을 찾을 수 없습니다</h1>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 선택된 부품 찾기 (mergedModel 우선 — 커스터마이징 반영)
  const selectedPart = (mergedModel ?? currentModelInfo)?.parts.find((p) => p.id === selectedPartId) || null;

  // 노트에 전달할 모델 정보 (활성 탭에 따라)
  const notesModelInfo = activeTab === 'simulation' && simModelInfo ? simModelInfo : (currentModelInfo || simModelInfo);

  return (
    <div className={`viewer-page h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      {/* 헤더 */}
      <header className={`h-14 flex-shrink-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Tooltip label="홈으로 돌아가기">
            <Link
              href="/"
              className={`p-2 rounded-lg block ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          </Tooltip>

          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SIMVEX"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {headerModelInfo.nameKo}
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {headerModelInfo.name}
              </p>
            </div>
          </div>

          {/* 탭 바 (헤더 내, 모델 이름 옆) */}
          {showTabs && (
            <div className="ml-4">
              <ViewerTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isDarkMode={isDarkMode}
                hasViewer={modelHasViewer}
                hasSimulation={modelHasSimulation}
                simulationName={simulationMapping?.nameKo}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip label="로그인 / 계정 관리">
            <AuthButton />
          </Tooltip>

          {/* 조작 가이드 버튼 */}
          <Tooltip label="3D 뷰어 조작 방법 안내">
            <button
              onClick={() => setShowControls(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Tooltip>

          {/* PDF 내보내기 버튼 */}
          {pdfModelInfo && (
            <Tooltip label="모델 정보를 PDF로 내보내기">
              <ExportPdfButton
                modelNameKo={pdfModelInfo.nameKo}
                modelName={pdfModelInfo.name}
                description={pdfModelInfo.description}
                theory={pdfModelInfo.theory}
                parts={pdfModelInfo.parts.map((p) => ({
                  nameKo: p.nameKo,
                  name: p.name,
                  description: p.description,
                }))}
                notes={notes}
                isDarkMode={isDarkMode}
              />
            </Tooltip>
          )}

          {/* 부품 트리 패널 토글 — 뷰어 탭 + 통합 모델만 */}
          {activeTab === 'viewer' && isCombinedModel && (
            <Tooltip label="부품 트리 탐색기">
              <button
                onClick={() => {
                  setIsTreePanelOpen(!isTreePanelOpen);
                  if (isTreePanelOpen) {
                    setFocusedPartId(null);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isTreePanelOpen
                    ? 'bg-cyan-500 text-white'
                    : isDarkMode
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>
            </Tooltip>
          )}

          {/* 주석 버튼 — 뷰어 탭에서만 표시 */}
          {activeTab === 'viewer' && isCombinedModel && (
            <Tooltip label="3D 주석 (핀 메모)">
              <button
                onClick={handleToggleAnnotationPanel}
                className={`p-2 rounded-lg transition-colors ${
                  isAnnotationPanelOpen
                    ? 'bg-amber-500 text-white'
                    : isDarkMode
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </button>
            </Tooltip>
          )}

          {/* 부품 메모 버튼 — 뷰어 탭에서만 표시 */}
          {activeTab === 'viewer' && isCombinedModel && (
            <Tooltip label="부품별 메모 (스크린샷 포함)">
              <button
                onClick={() => setIsMemoPanelOpen(!isMemoPanelOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isMemoPanelOpen
                    ? 'bg-teal-500 text-white'
                    : isDarkMode
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </Tooltip>
          )}

          {/* 퀴즈 버튼 — 뷰어 탭에서만 표시 */}
          {activeTab === 'viewer' && modelHasQuiz && (
            <Tooltip label="학습 퀴즈 풀기">
              <button
                onClick={() => setIsQuizPanelOpen(!isQuizPanelOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isQuizPanelOpen
                    ? 'bg-green-500 text-white'
                    : isDarkMode
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            </Tooltip>
          )}

          {/* Learn 토글 — 시뮬레이션 탭에서만 표시 */}
          {activeTab === 'simulation' && modelHasSimulation && (
            <Tooltip label="학습 패널">
              <button
                onClick={() => setShowLearning(!showLearning)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  showLearning
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm">Learn</span>
              </button>
            </Tooltip>
          )}

          {/* 노트 패널 토글 */}
          <Tooltip label="노트 / AI 어시스턴트">
            <button
              onClick={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isNotesPanelOpen
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </Tooltip>

          {/* 다크모드 토글 */}
          <Tooltip label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </Tooltip>
        </div>
      </header>

      {/* 메인 컨텐츠 — 뷰어 탭 */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ display: activeTab === 'viewer' ? 'flex' : 'none' }}
      >
        {modelHasViewer && (
          <>
            {/* 왼쪽 부품 트리 패널 */}
            {isTreePanelOpen && isCombinedModel && mergedModel && (
              <>
                <div
                  className={`flex-shrink-0 overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
                  style={{ width: treePanelWidth, minWidth: 200, maxWidth: 500 }}
                >
                  <PartTreePanel
                    isDarkMode={isDarkMode}
                    modelNameKo={mergedModel.nameKo}
                    parts={mergedModel.parts}
                    selectedPartId={selectedPartId}
                    focusedPartId={focusedPartId}
                    onFocusPart={handleFocusPart}
                    onSelectPart={handleSelectPart}
                  />
                </div>
                {/* 트리 패널 리사이즈 핸들 */}
                <div
                  className={`w-1.5 flex-shrink-0 cursor-ew-resize group relative z-20 ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  }`}
                  onMouseDown={handleTreeResizeStart}
                >
                  <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-all group-hover:w-1 ${
                    isDarkMode ? 'group-hover:bg-cyan-400' : 'group-hover:bg-cyan-500'
                  }`} />
                </div>
              </>
            )}

            {/* 3D 뷰포트 */}
            <div className="flex-1 min-w-0 p-4 relative">
              {isCombinedModel && mergedModel ? (
                <CombinedModelViewer
                  model={mergedModel}
                  explodeValue={explodeValue}
                  selectedPartId={selectedPartId}
                  hoveredPartId={hoveredPartId}
                  visibleParts={visibleParts}
                  onSelectPart={handleSelectPart}
                  onHoverPart={setHoveredPartId}
                  cameraPosition={cameraPosition}
                  cameraTarget={cameraTarget}
                  isDarkMode={isDarkMode}
                  onCameraChange={handleUpdateCamera}
                  annotations={annotations}
                  activeAnnotationId={activeAnnotationId}
                  showAllAnnotations={showAllAnnotations}
                  isPlacingPin={isPlacingPin}
                  onPlacePin={handlePlacePin}
                  onAnnotationPinClick={handleAnnotationPinClick}
                  containerRef={viewportRef}
                  focusedPartId={focusedPartId}
                  onMeshPositions={handleMeshPositions}
                />
              ) : model ? (
                <ModelViewer
                  model={model}
                  cameraPosition={cameraPosition}
                  cameraTarget={cameraTarget}
                />
              ) : null}
              <ControlsHelp show={showControls} onDismiss={() => setShowControls(false)} isDarkMode={isDarkMode} controls={VIEWER_CONTROLS_GUIDE} />
            </div>

            {/* 사이드바 리사이즈 핸들 (별도 flex 아이템) */}
            <div
              className={`w-1.5 flex-shrink-0 cursor-ew-resize group relative z-20 ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}
              onMouseDown={handleSidebarResizeStart}
            >
              <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-all group-hover:w-1 ${
                isDarkMode ? 'group-hover:bg-blue-400' : 'group-hover:bg-blue-500'
              }`} />
            </div>

            {/* 우측 패널 */}
            <div
              className={`flex-shrink-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} overflow-y-auto p-4 space-y-4`}
              style={{ width: sidebarWidth, minWidth: 240, maxWidth: 600 }}
            >
              {/* 분해/조립 슬라이더 */}
              <ExplodeSlider />

              {/* 제품 정보 */}
              {currentModelInfo && <ProductInfo model={currentModelInfo} />}

              {/* 부품 정보 */}
              <PartInfo
                part={selectedPart}
                isLoggedIn={!!user}
                customization={selectedPartId ? customizations[selectedPartId] : undefined}
                onCustomize={upsertCustomization}
                onResetCustomize={resetCustomization}
              />

              {/* 부품 목록 */}
              {(mergedModel ?? currentModelInfo) && <PartsList parts={(mergedModel ?? currentModelInfo)!.parts} />}
            </div>
          </>
        )}
      </div>

      {/* 메인 컨텐츠 — 시뮬레이션 탭 */}
      {modelHasSimulation && (
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ display: activeTab === 'simulation' ? 'flex' : 'none' }}
        >
          <SimulationTabContent
            modelId={modelId}
            isDarkMode={isDarkMode}
            showLearning={showLearning}
            onCloseLearning={() => setShowLearning(false)}
          />
        </div>
      )}

      {/* 노트 패널 (슬라이드) */}
      <div
        className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}
        transform transition-transform duration-300 ease-in-out z-50
        ${isNotesPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: notesPanelWidth }}
      >
        {/* 리사이즈 핸들 */}
        <div
          className={`absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors ${
            isDarkMode ? 'hover:bg-blue-400' : 'hover:bg-blue-500'
          }`}
          onMouseDown={handleResizeStart}
        />
        <div className="h-full p-4">
          {notesModelInfo && (
            <NotesPanel
              modelInfo={notesModelInfo}
              selectedPart={selectedPart}
              user={user}
              modelId={modelId}
            />
          )}
        </div>
      </div>

      {/* 퀴즈 패널 (슬라이드) */}
      {quiz && currentModelInfo && (
        <div
          className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          } border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}
          transform transition-transform duration-300 ease-in-out z-50
          ${isQuizPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: 420 }}
        >
          <QuizPanel
            quiz={quiz}
            modelId={currentModelInfo.id}
            isDarkMode={isDarkMode}
            onClose={() => setIsQuizPanelOpen(false)}
            selectedPartId={selectedPartId}
            onRequestPartSelect={handleQuizRequestPartSelect}
            onClearPartSelect={handleQuizClearPartSelect}
          />
        </div>
      )}

      {/* 주석 패널 (슬라이드) */}
      <div
        className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}
        transform transition-transform duration-300 ease-in-out z-50
        ${isAnnotationPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 380 }}
      >
        <AnnotationPanel
          modelId={modelId}
          annotations={annotations}
          isDarkMode={isDarkMode}
          isLoggedIn={!!user}
          onClose={handleToggleAnnotationPanel}
          onCreate={createAnnotation}
          onUpdate={updateAnnotation}
          onDelete={deleteAnnotation}
          onScreenshot={handleAnnotationScreenshot}
        />
      </div>

      {/* 부품 메모 패널 (슬라이드) */}
      <div
        className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}
        transform transition-transform duration-300 ease-in-out z-50
        ${isMemoPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 380 }}
      >
        <PartMemoPanel
          isDarkMode={isDarkMode}
          isLoggedIn={!!user}
          selectedPart={selectedPart}
          memos={memos}
          loading={memosLoading}
          onCreateMemo={createMemo}
          onDeleteMemo={deleteMemo}
          onCaptureScreenshot={captureScreenshot}
          onClose={() => setIsMemoPanelOpen(false)}
        />
      </div>
    </div>
  );
}
