'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getModelById, getCombinedModelById, combinedModels } from '@/data/models';
import { useViewerStore } from '@/lib/store/viewerStore';
import { ExplodeSlider } from '@/components/viewer/ExplodeSlider';
import { ProductInfo } from '@/components/viewer/ProductInfo';
import { PartInfo } from '@/components/viewer/PartInfo';
import { NotesPanel } from '@/components/notes/NotesPanel';
import { AIChatPanel } from '@/components/ai/AIChatPanel';

import { AuthButton } from '@/components/auth/AuthButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { ScrapButton } from '@/components/scrap/ScrapButton';
import { ShareButton } from '@/components/share/ShareButton';
import { DownloadButton } from '@/components/download/DownloadButton';
import { QuizPanel } from '@/components/quiz/QuizPanel';
import { ExportPdfButton } from '@/components/export/ExportPdfButton';
import { jsonContentToText } from '@/lib/export/pdfGenerator';
import { useUser } from '@/hooks/useUser';
import { ModelConfig } from '@/types/viewer';
import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';
import { createClient } from '@/lib/supabase/client';
import { userModelToConfig } from '@/types/userModel';
import { getQuizByModelId, hasQuiz } from '@/data/quizzes';
import { Tooltip } from '@/components/ui/Tooltip';
import { ControlsHelp } from '@/components/ui/ControlsHelp';
import { useScraps } from '@/hooks/useScraps';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useAnnotationStore } from '@/lib/store/annotationStore';
import { AnnotationPanel } from '@/components/annotation/AnnotationPanel';
import { usePartCustomizations } from '@/hooks/usePartCustomizations';
import { useNotes } from '@/hooks/useNotes';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { PartTreePanel } from '@/components/viewer/PartTreePanel';
import { ViewerTabs, ViewerTabType } from '@/components/viewer/ViewerTabs';
import { SimulationTabContent } from '@/components/viewer/SimulationTabContent';
import { hasSimulation as checkHasSimulation, hasViewer as checkHasViewer, getSimulationMapping } from '@/data/simulationMapping';
import { getSimulationModelInfo } from '@/data/simulationModelInfo';

type RightSidebarTab = 'model' | 'notes' | 'quiz';

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
    <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">3D 모델 로딩 중...</p>
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
  const { isScraped, toggleScrap } = useScraps(user);
  const { notes: noteItems } = useNotes(user, modelId);
  const { messages: chatMessages } = useSupabaseChat(user, modelId);
  const [showLogin, setShowLogin] = useState(false);

  // 로그인 성공 시 모달 자동 닫기
  useEffect(() => {
    if (user && showLogin) setShowLogin(false);
  }, [user, showLogin]);

  // 사용자 업로드 모델 (u-{uuid} 형식)
  const isUserModel = modelId.startsWith('u-');
  const [userModel, setUserModel] = useState<CombinedModelConfig | null>(null);
  const [userModelLoading, setUserModelLoading] = useState(isUserModel);
  const [userModelFbxUrl, setUserModelFbxUrl] = useState<string | null>(null);

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

          // FBX 원본 URL
          if (data.original_fbx_storage_path) {
            const { data: fbxUrlData } = supabase.storage
              .from('user-models')
              .getPublicUrl(data.original_fbx_storage_path);
            setUserModelFbxUrl(fbxUrlData.publicUrl);
          }
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
    togglePartVisibility,
    isDarkMode,
    toggleDarkMode,
    notes,
    getModelState,
    setModelState,
    globalOpacity,
    createPartGroup,
    deletePartGroup,
    renamePartGroup,
    movePartToGroup,
    toggleGroupCollapsed,
    moveGroupToGroup,
    reorderGroups,
    showControlsGuide,
    toggleControlsGuide,
  } = useViewerStore();

  // 우측 사이드바 탭 (모델/노트/퀴즈)
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('model');

  // 노트 탭 내 서브탭 (나의 노트 / 핀 주석)
  type NotesSubTab = 'mynotes' | 'annotations';
  const [notesSubTab, setNotesSubTab] = useState<NotesSubTab>('mynotes');

  // 열린 모델 탭 (브라우저 탭 스타일)
  const MAX_VISIBLE_TABS = 2;
  const [openTabs, setOpenTabs] = useState<string[]>([modelId]);
  const [tabScrollOffset, setTabScrollOffset] = useState(0);

  // AI 플로팅 위젯 (left/top 기준, 초기값은 마운트 후 설정)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiFabPos, setAiFabPos] = useState<{ x: number; y: number } | null>(null);
  const aiFabDragging = useRef(false);
  const aiFabStartMouse = useRef({ x: 0, y: 0 });
  const aiFabStartPos = useRef({ x: 0, y: 0 });

  // AI 패널 리사이즈
  const [aiPanelSize, setAiPanelSize] = useState({ w: 420, h: 500 });
  const aiResizing = useRef(false);
  const aiResizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const [sidebarWidth, setSidebarWidth] = useState(320); // 기본 w-80 = 320px

  // 부품 트리 패널
  const [isTreePanelOpen, setIsTreePanelOpen] = useState(true);
  const [treePanelWidth, setTreePanelWidth] = useState(280);
  const [focusedPartId, setFocusedPartId] = useState<string | null>(null);
  const [treeSearchFilter, setTreeSearchFilter] = useState('');
  const [meshPositions, setMeshPositions] = useState<Record<string, [number, number, number]>>({});
  const isTreeResizing = useRef(false);
  const isSidebarResizing = useRef(false);

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

  // === 열린 탭 관리 ===
  // 모델 변경 시 탭 추가 + localStorage 동기화
  useEffect(() => {
    const saved = localStorage.getItem('simvex-open-viewer-tabs');
    let tabs: string[] = [];
    if (saved) {
      try { tabs = JSON.parse(saved); } catch { /* ignore */ }
    }
    if (!tabs.includes(modelId)) {
      tabs = [...tabs, modelId];
    }
    setOpenTabs(tabs);
    localStorage.setItem('simvex-open-viewer-tabs', JSON.stringify(tabs));
  }, [modelId]);

  // 현재 모델 탭이 보이도록 스크롤 자동 조정 (모델 또는 탭 목록 변경 시)
  useEffect(() => {
    const idx = openTabs.indexOf(modelId);
    if (idx < 0) return;
    setTabScrollOffset(prev => {
      if (idx < prev) return idx;
      if (idx >= prev + MAX_VISIBLE_TABS) return idx - MAX_VISIBLE_TABS + 1;
      return prev;
    });
  }, [openTabs, modelId, MAX_VISIBLE_TABS]);

  // 탭 닫기
  const handleCloseTab = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newTabs = openTabs.filter(id => id !== tabId);
    if (newTabs.length === 0) {
      localStorage.removeItem('simvex-open-viewer-tabs');
      router.push('/models');
      return;
    }
    localStorage.setItem('simvex-open-viewer-tabs', JSON.stringify(newTabs));
    setOpenTabs(newTabs);
    if (tabId === modelId) {
      const idx = openTabs.indexOf(tabId);
      const nextTab = newTabs[Math.min(idx, newTabs.length - 1)];
      router.push(`/viewer/${nextTab}`);
    }
    setTabScrollOffset(prev => Math.min(prev, Math.max(0, newTabs.length - MAX_VISIBLE_TABS)));
  }, [openTabs, modelId, router, MAX_VISIBLE_TABS]);

  // 탭 이름 + 서브타이틀 조회
  const getTabInfo = useCallback((tabId: string): { name: string; subtitle: string } => {
    const cm = combinedModels.find(m => m.id === tabId);
    if (cm) return { name: cm.nameKo, subtitle: `${cm.name} (${cm.category})` };
    const im = getModelById(tabId);
    if (im) return { name: im.nameKo, subtitle: `${im.name} (${im.category})` };
    if (tabId.startsWith('u-') && tabId === modelId && userModel) return { name: userModel.nameKo, subtitle: userModel.name };
    if (tabId.startsWith('u-')) return { name: '사용자 모델', subtitle: 'User Model' };
    return { name: tabId, subtitle: '' };
  }, [modelId, userModel]);

  // + 버튼 드롭다운
  const [showAddTabMenu, setShowAddTabMenu] = useState(false);
  const addTabMenuRef = useRef<HTMLDivElement>(null);

  // 열려있지 않은 모델 목록 (드롭다운에 표시)
  const availableModelsToAdd = useMemo(() => {
    return combinedModels.filter(m => !openTabs.includes(m.id));
  }, [openTabs]);

  // 모델 탭 추가
  const handleAddTab = useCallback((addModelId: string) => {
    const newTabs = [...openTabs, addModelId];
    setOpenTabs(newTabs);
    localStorage.setItem('simvex-open-viewer-tabs', JSON.stringify(newTabs));
    setShowAddTabMenu(false);
    router.push(`/viewer/${addModelId}`);
  }, [openTabs, router]);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    if (!showAddTabMenu) return;
    const handler = (e: MouseEvent) => {
      if (addTabMenuRef.current && !addTabMenuRef.current.contains(e.target as Node)) {
        setShowAddTabMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAddTabMenu]);

  // 보이는 탭 + 스크롤 가능 여부
  const visibleTabs = openTabs.slice(tabScrollOffset, tabScrollOffset + MAX_VISIBLE_TABS);
  const canScrollLeft = tabScrollOffset > 0;
  const canScrollRight = tabScrollOffset + MAX_VISIBLE_TABS < openTabs.length;

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
    draggingAnnotationId,
    dragPreviewPosition,
    dragTargetInfo,
    setDraggingAnnotation,
    setDragPreview,
    clearDrag,
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

  // 핀 드래그 시작
  const handleDragStart = useCallback((id: string) => {
    setDraggingAnnotation(id);
  }, [setDraggingAnnotation]);

  // 핀 드래그 이동 (onPointerMove에서 호출)
  const handleDragMove = useCallback((point: [number, number, number], partId?: string) => {
    setDragPreview(point, { targetType: partId ? 'part' : 'coordinate', partId });
  }, [setDragPreview]);

  // 핀 드래그 완료: window pointerup
  useEffect(() => {
    if (!draggingAnnotationId) return;

    const handlePointerUp = () => {
      if (dragPreviewPosition) {
        updateAnnotation(draggingAnnotationId, {
          position: dragPreviewPosition,
          target_type: dragTargetInfo?.targetType || 'coordinate',
          part_id: dragTargetInfo?.partId || null,
        });
      }
      clearDrag();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearDrag();
      }
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draggingAnnotationId, dragPreviewPosition, dragTargetInfo, updateAnnotation, clearDrag]);

  // 노트탭 핀주석 서브탭 ↔ annotationStore 동기화
  const isAnnotationSubTabActive = rightSidebarTab === 'notes' && notesSubTab === 'annotations';
  useEffect(() => {
    if (isAnnotationSubTabActive !== isAnnotationPanelOpen) {
      setAnnotationPanelOpen(isAnnotationSubTabActive);
      if (!isAnnotationSubTabActive) {
        setPlacingPin(false);
        setPendingAnnotation(null);
        setActiveAnnotationId(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnnotationSubTabActive]);

  // annotationStore에서 열림 요청 시 → 노트탭 핀주석으로 전환
  useEffect(() => {
    if (isAnnotationPanelOpen && !isAnnotationSubTabActive) {
      setRightSidebarTab('notes');
      setNotesSubTab('annotations');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnnotationPanelOpen]);

  // 주석 핀 클릭 콜백 → 노트탭 핀주석 서브탭으로 전환
  const handleAnnotationPinClick = useCallback((id: string) => {
    setActiveAnnotationId(activeAnnotationId === id ? null : id);
    if (!isAnnotationPanelOpen) setAnnotationPanelOpen(true);
    setRightSidebarTab('notes');
    setNotesSubTab('annotations');
  }, [activeAnnotationId, isAnnotationPanelOpen, setActiveAnnotationId, setAnnotationPanelOpen]);

  // partTag 클릭 이벤트 리스너 (노트 내 부품 태그 클릭 → 부품 선택)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ partId: string }>).detail;
      if (detail?.partId) {
        setSelectedPartId(detail.partId);
      }
    };
    window.addEventListener('partTagClick', handler);
    return () => window.removeEventListener('partTagClick', handler);
  }, [setSelectedPartId]);

  // 부품 선택 시 핀 말풍선 닫기
  const handleSelectPart = useCallback((partId: string | null) => {
    setSelectedPartId(partId);
    setActiveAnnotationId(null);
  }, [setSelectedPartId, setActiveAnnotationId]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">모델 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 모델이 없고 시뮬레이션도 없으면 에러 페이지
  if (!headerModelInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">모델을 찾을 수 없습니다</h1>
          <Link
            href="/models"
            className="text-[#001AFF] hover:text-blue-700 transition-colors"
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
    <>
    <div className={`viewer-page h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      {/* 헤더 */}
      <header className={`h-[72px] flex-shrink-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} px-6 flex items-center relative z-10`} style={{ boxShadow: isDarkMode ? '0 0 8.4px rgba(0,0,0,0.5)' : '0 0 8.4px rgba(0,0,0,0.25)' }}>
        {/* 왼쪽: 로고 */}
        <Link href="/models" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <span className={`text-[26px] ${isDarkMode ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Righteous', fontWeight: 400 }}>
            SIMVEX
          </span>
        </Link>

        {/* 모델 탭 */}
        <div className="flex items-center gap-1 ml-40">
          {/* 왼쪽 화살표 (항상 공간 확보) */}
          <button
            onClick={() => setTabScrollOffset(prev => Math.max(0, prev - 1))}
            className={`p-1.5 rounded-md transition-all duration-200 shrink-0 ${
              canScrollLeft
                ? isDarkMode ? 'hover:bg-gray-800 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                : 'invisible'
            }`}
            disabled={!canScrollLeft}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 탭 목록 */}
          <div className="flex items-stretch gap-0">
            {visibleTabs.map((tabId) => {
              const isActive = tabId === modelId;
              const { name: tabName, subtitle: tabSub } = getTabInfo(tabId);
              return (
                <div key={tabId} className="relative group">
                  <Link
                    href={`/viewer/${tabId}`}
                    className={`block pl-4 pr-8 py-2 min-w-[140px] max-w-[200px] border transition-all duration-200 ${
                      isActive
                        ? isDarkMode
                          ? 'bg-gray-800 border-gray-700 shadow-sm'
                          : 'bg-white border-gray-200 shadow-sm'
                        : isDarkMode
                          ? 'border-transparent hover:bg-gray-800/40'
                          : 'border-transparent hover:bg-gray-50'
                    } rounded-lg`}
                  >
                    <p className={`text-[14px] font-bold leading-tight truncate ${
                      isActive
                        ? isDarkMode ? 'text-white' : 'text-gray-900'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>{tabName}</p>
                    <p className={`text-[11px] leading-tight truncate mt-0.5 ${
                      isActive
                        ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                    }`}>{tabSub}</p>
                  </Link>
                  {/* 닫기 버튼 */}
                  <button
                    onClick={(e) => handleCloseTab(e, tabId)}
                    className={`absolute right-1.5 top-2 p-0.5 rounded transition-all duration-150 ${
                      isActive
                        ? isDarkMode
                          ? 'text-gray-500 hover:text-gray-200 hover:bg-gray-700'
                          : 'text-gray-300 hover:text-gray-600 hover:bg-gray-200'
                        : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600 hover:bg-gray-200'
                    }`}
                    title="탭 닫기"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* 오른쪽 화살표 (항상 공간 확보) */}
          <button
            onClick={() => setTabScrollOffset(prev => Math.min(openTabs.length - MAX_VISIBLE_TABS, prev + 1))}
            className={`p-1.5 rounded-md transition-all duration-200 shrink-0 ${
              canScrollRight
                ? isDarkMode ? 'hover:bg-gray-800 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                : 'invisible'
            }`}
            disabled={!canScrollRight}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* + 새 모델 탭 추가 */}
          <div className="relative ml-1" ref={addTabMenuRef}>
            <button
              onClick={() => setShowAddTabMenu(!showAddTabMenu)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border border-dashed transition-all duration-200 ${
                showAddTabMenu
                  ? 'border-[#001AFF] text-[#001AFF] bg-blue-50'
                  : isDarkMode
                    ? 'border-gray-600 text-gray-500 hover:border-[#001AFF] hover:text-[#001AFF]'
                    : 'border-gray-300 text-gray-400 hover:border-[#001AFF] hover:text-[#001AFF]'
              }`}
              title="모델 추가"
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${showAddTabMenu ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {showAddTabMenu && (
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`} style={{ animation: 'fadeIn 0.15s ease' }}>
                <div className={`px-3 py-2 text-[12px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  모델 추가
                </div>
                {availableModelsToAdd.length > 0 ? (
                  <div className="py-1 max-h-[240px] overflow-y-auto">
                    {availableModelsToAdd.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleAddTab(m.id)}
                        className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors flex items-center gap-2.5 ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#001AFF] shrink-0" />
                        <span className="truncate">{m.nameKo}</span>
                        <span className={`text-[11px] ml-auto shrink-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{m.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={`px-3 py-4 text-center text-[13px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    모든 모델이 이미 열려있습니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 뷰어/시뮬레이션 탭 (해당 모델에 시뮬레이션이 있을 때만) */}
          {showTabs && modelHasSimulation && (
            <>
              <div className={`w-px h-5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} mx-1`} />
              <ViewerTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isDarkMode={isDarkMode}
                hasViewer={modelHasViewer}
                hasSimulation={modelHasSimulation}
                simulationName={simulationMapping?.nameKo}
              />
            </>
          )}
        </div>

        {/* 오른쪽: 액션 아이콘 + 프로필 */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* 뷰어 도구 */}
          {activeTab === 'viewer' && isCombinedModel && (
            <>
              <Tooltip label="부품 트리 탐색기">
                <button
                  onClick={() => {
                    setIsTreePanelOpen(!isTreePanelOpen);
                    if (isTreePanelOpen) setFocusedPartId(null);
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isTreePanelOpen
                      ? 'bg-[#001AFF] text-white shadow-sm'
                      : isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                </button>
              </Tooltip>

              <div className={`w-px h-5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'}`} />
            </>
          )}

          {/* 시뮬레이션 Learn 버튼 */}
          {activeTab === 'simulation' && modelHasSimulation && (
            <>
              <Tooltip label="학습 패널">
                <button
                  onClick={() => setShowLearning(!showLearning)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    showLearning
                      ? 'bg-[#001AFF] text-white'
                      : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-medium">Learn</span>
                </button>
              </Tooltip>
              <div className={`w-px h-5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'}`} />
            </>
          )}

          {/* AI 어시스턴트 버튼은 뷰포트 내 플로팅 위젯으로 이동 */}

          {/* 모델 액션 */}
          <Tooltip label={isScraped(isUserModel ? 'user' : 'builtin', isUserModel ? modelId.slice(2) : modelId) ? '스크랩 해제' : '스크랩'}>
            <ScrapButton
              user={user}
              isScraped={isScraped(isUserModel ? 'user' : 'builtin', isUserModel ? modelId.slice(2) : modelId)}
              scrapInput={
                isUserModel
                  ? { model_type: 'user', model_id: modelId.slice(2), user_model_id: modelId.slice(2) }
                  : { model_type: 'builtin', model_id: modelId }
              }
              onToggle={toggleScrap}
              isDarkMode={isDarkMode}
              size="md"
              onLoginRequired={() => setShowLogin(true)}
            />
          </Tooltip>

          <Tooltip label="공유 링크 복사">
            <ShareButton modelId={modelId} isDarkMode={isDarkMode} size="md" />
          </Tooltip>

          {isCombinedModel && combinedModel && (
            <Tooltip label="3D 모델 다운로드">
              <DownloadButton
                modelType={isUserModel ? 'user' : 'builtin'}
                glbUrl={combinedModel.glbPath}
                fbxUrl={isUserModel ? (userModelFbxUrl ?? undefined) : undefined}
                modelName={combinedModel.nameKo || combinedModel.name}
                isDarkMode={isDarkMode}
                size="md"
                user={user}
                onLoginRequired={() => setShowLogin(true)}
              />
            </Tooltip>
          )}

          <Tooltip label="스크린샷 캡처">
            <button
              onClick={handleAnnotationScreenshot}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </Tooltip>

          {pdfModelInfo && (
            <Tooltip label="PDF 내보내기">
              <ExportPdfButton
                modelNameKo={pdfModelInfo.nameKo}
                modelName={pdfModelInfo.name}
                description={pdfModelInfo.description}
                theory={pdfModelInfo.theory}
                noteItems={noteItems.map((n) => ({
                  title: n.title,
                  content: jsonContentToText(n.content),
                  updatedAt: n.updated_at,
                }))}
                chatMessages={chatMessages.map((m) => ({
                  role: m.role,
                  content: m.content,
                }))}
                isDarkMode={isDarkMode}
              />
            </Tooltip>
          )}

          <div className={`w-px h-5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'}`} />

          {/* 전역 설정 */}
          <Tooltip label={isDarkMode ? '라이트 모드' : '다크 모드'}>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
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

          <AuthButton variant="viewer" />
        </div>
      </header>

      {/* 메인 컨텐츠 — 뷰어 탭 */}
      <div
        className="flex-1 flex overflow-hidden min-h-0"
        style={{ display: activeTab === 'viewer' ? 'flex' : 'none' }}
      >
        {modelHasViewer && (
          <>
            {/* 왼쪽 부품 트리 패널 */}
            {isCombinedModel && mergedModel && (
              <>
                {isTreePanelOpen ? (
                  <>
                    <div
                      className={`flex-shrink-0 overflow-hidden flex flex-col min-h-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      style={{ width: treePanelWidth, minWidth: 200, maxWidth: 500 }}
                    >
                      {/* 모델 정보 + 패널 닫기 */}
                      <div className="px-4 py-3 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[16px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {getModelState(mergedModel.id)?.rootName || mergedModel.nameKo}
                            </span>
                          </div>
                          <p className={`text-[12px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            내 워크플레이스
                          </p>
                        </div>
                        <button
                          onClick={() => setIsTreePanelOpen(false)}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                            isDarkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="패널 닫기"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4v16" />
                          </svg>
                        </button>
                      </div>

                      {/* 검색바 */}
                      <div className="px-4 pb-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search for..."
                            value={treeSearchFilter}
                            onChange={(e) => setTreeSearchFilter(e.target.value)}
                            className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-colors ${
                              isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-gray-600'
                                : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:border-gray-300'
                            }`}
                          />
                          <svg className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* 부품 트리 */}
                      <PartTreePanel
                        isDarkMode={isDarkMode}
                        modelNameKo={mergedModel.nameKo}
                        rootName={getModelState(mergedModel.id)?.rootName}
                        parts={mergedModel.parts}
                        selectedPartId={selectedPartId}
                        focusedPartId={focusedPartId}
                        visibleParts={visibleParts}
                        groups={getModelState(mergedModel.id)?.partTreeGroups ?? []}
                        searchFilter={treeSearchFilter}
                        onFocusPart={handleFocusPart}
                        onSelectPart={handleSelectPart}
                        onToggleVisibility={togglePartVisibility}
                        onSetAllVisible={setAllPartsVisible}
                        onCreateGroup={(name, parentGroupId) => createPartGroup(mergedModel.id, name, parentGroupId ?? null)}
                        onDeleteGroup={(groupId) => deletePartGroup(mergedModel.id, groupId)}
                        onRenameGroup={(groupId, name) => renamePartGroup(mergedModel.id, groupId, name)}
                        onMovePartToGroup={(partId, groupId) => movePartToGroup(mergedModel.id, partId, groupId)}
                        onToggleGroupCollapsed={(groupId) => toggleGroupCollapsed(mergedModel.id, groupId)}
                        onMoveGroupToGroup={(src, tgt) => moveGroupToGroup(mergedModel.id, src, tgt)}
                        onReorderGroups={(parentId, ids) => reorderGroups(mergedModel.id, parentId, ids)}
                        onRenameRoot={(name) => setModelState(mergedModel.id, { rootName: name })}
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
                ) : null}
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
                  globalOpacity={globalOpacity}
                  isDraggingPin={!!draggingAnnotationId}
                  onDragMove={handleDragMove}
                  draggingAnnotationId={draggingAnnotationId}
                  dragPreviewPosition={dragPreviewPosition}
                  dragTargetInfo={dragTargetInfo}
                  onDragStart={handleDragStart}
                />
              ) : model ? (
                <ModelViewer
                  model={model}
                  cameraPosition={cameraPosition}
                  cameraTarget={cameraTarget}
                />
              ) : null}
              {/* 부품 트리 접힌 상태: 플로팅 세로 탭 */}
              {!isTreePanelOpen && isCombinedModel && mergedModel && (
                <button
                  onClick={() => setIsTreePanelOpen(true)}
                  className={`absolute left-0 top-4 z-30 flex items-center justify-center rounded-r-lg shadow-md border border-l-0 cursor-pointer transition-all hover:shadow-lg ${
                    isDarkMode
                      ? 'bg-gray-900/90 border-gray-700 hover:bg-gray-800/90'
                      : 'bg-white/90 border-gray-200 hover:bg-white'
                  }`}
                  style={{ width: 24, height: 100 }}
                  title="부품 트리 열기"
                >
                  <span
                    className={`text-[11px] font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    부품 트리
                  </span>
                </button>
              )}

              <ControlsHelp show={showControlsGuide} onDismiss={toggleControlsGuide} isDarkMode={isDarkMode} controls={VIEWER_CONTROLS_GUIDE} />

              {/* 조작 가이드 토글 버튼 (좌하단, 가이드 닫혀있을 때 표시) */}
              {!showControlsGuide && (
                <button
                  onClick={toggleControlsGuide}
                  className={`absolute bottom-4 left-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-lg backdrop-blur-md shadow-md border text-xs font-medium transition-all hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-800/80 border-gray-700/50 text-gray-300 hover:bg-gray-700/80'
                      : 'bg-white/80 border-gray-200/50 text-gray-600 hover:bg-white/90'
                  }`}
                  title="조작 가이드 보기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  조작 가이드
                </button>
              )}

              {/* 3D 뷰어 라벨 */}
              <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 backdrop-blur-sm rounded-full border shadow-sm transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-900/80 border-gray-700 text-gray-400'
                  : 'bg-white/80 border-gray-200 text-gray-500'
              }`}>
                <span className="text-[13px] font-medium">3D뷰어</span>
              </div>
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

            {/* 우측 패널 (탭) */}
            <div
              className={`flex-shrink-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col overflow-hidden relative`}
              style={{ width: sidebarWidth, minWidth: 240, maxWidth: 600 }}
            >
              {/* 왼쪽 파란색 그라디언트 액센트 */}
              {!isDarkMode && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] z-10" style={{ background: 'linear-gradient(to bottom, #818CF8, #60A5FA, #BFDBFE)' }} />
              )}
              {/* 사이드바 탭 헤더 */}
              <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} pt-3 shrink-0`}>
                {(['model', 'notes', 'quiz'] as const).map((tab) => {
                  const labels = { model: '모델', notes: '노트', quiz: '퀴즈' };
                  const isActive = rightSidebarTab === tab;
                  if (tab === 'quiz' && !modelHasQuiz) return null;
                  return (
                    <button
                      key={tab}
                      onClick={() => setRightSidebarTab(tab)}
                      className={`flex-1 pb-3 text-[14px] font-medium text-center transition-all duration-200 border-b-2 ${
                        isActive
                          ? isDarkMode
                            ? 'text-white border-white'
                            : 'text-[#001AFF] border-[#001AFF]'
                          : isDarkMode
                            ? 'text-gray-500 border-transparent hover:text-gray-300'
                            : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* 탭 콘텐츠 */}
              <div className="flex-1 overflow-y-auto">
                {/* 모델 탭 */}
                {rightSidebarTab === 'model' && (
                  <div className={`p-4 space-y-4 min-h-full ${isDarkMode ? '' : 'bg-[#F0F4FF]'}`} style={{ animation: 'fadeIn 0.2s ease' }}>
                    {/* 구조 제어 카드 */}
                    <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
                      <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} mb-4`}>구조 제어</h3>
                      <ExplodeSlider />
                    </div>

                    {/* 모델 정보 카드 */}
                    <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
                      <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} mb-4`}>모델 정보</h3>
                      {currentModelInfo && (
                        <ProductInfo
                          model={currentModelInfo}
                          customName={mergedModel ? getModelState(mergedModel.id)?.rootName : undefined}
                          onRename={mergedModel ? (name) => setModelState(mergedModel.id, { rootName: name || undefined }) : undefined}
                          isDarkMode={isDarkMode}
                        />
                      )}
                    </div>

                    {/* 부품 세부 정보 카드 */}
                    <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
                      <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} mb-4`}>부품 세부 정보</h3>
                      <PartInfo
                        part={selectedPart}
                        isLoggedIn={!!user}
                        customization={selectedPartId ? customizations[selectedPartId] : undefined}
                        onCustomize={upsertCustomization}
                        onResetCustomize={resetCustomization}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                )}

                {/* 노트 탭 */}
                {rightSidebarTab === 'notes' && (
                  <div className="h-full flex flex-col" style={{ animation: 'fadeIn 0.2s ease' }}>
                    {/* 서브탭 */}
                    <div className={`flex items-center gap-1 px-4 pt-3 pb-0 shrink-0`}>
                      {([
                        { id: 'mynotes' as const, label: '나의 노트', icon: (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )},
                        { id: 'annotations' as const, label: '핀 주석', icon: (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        )},
                      ]).map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setNotesSubTab(sub.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            notesSubTab === sub.id
                              ? isDarkMode
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-900'
                              : isDarkMode
                                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {sub.icon}
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {/* 서브탭 콘텐츠 */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                      {notesSubTab === 'mynotes' && (
                        <div className="h-full p-4">
                          <NotesPanel
                            modelId={modelId}
                            user={user}
                            isDarkMode={isDarkMode}
                            selectedPartId={selectedPartId}
                            selectedPartName={selectedPart?.nameKo ?? null}
                            onSelectPart={handleSelectPart}
                          />
                        </div>
                      )}

                      {notesSubTab === 'annotations' && (
                        <AnnotationPanel
                          modelId={modelId}
                          annotations={annotations}
                          isDarkMode={isDarkMode}
                          isLoggedIn={!!user}
                          onClose={() => setNotesSubTab('mynotes')}
                          onCreate={createAnnotation}
                          onUpdate={updateAnnotation}
                          onDelete={deleteAnnotation}
                          onScreenshot={handleAnnotationScreenshot}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 퀴즈 탭 */}
                {rightSidebarTab === 'quiz' && quiz && currentModelInfo && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <QuizPanel
                      quiz={quiz}
                      modelId={currentModelInfo.id}
                      isDarkMode={isDarkMode}
                      onClose={() => setRightSidebarTab('model')}
                      selectedPartId={selectedPartId}
                      onRequestPartSelect={handleQuizRequestPartSelect}
                      onClearPartSelect={handleQuizClearPartSelect}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 메인 컨텐츠 — 시뮬레이션 탭 */}
      {modelHasSimulation && (
        <div
          className="flex-1 flex flex-col overflow-hidden min-h-0"
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

      {/* AI 플로팅 위젯 — 뷰포트 내 드래그 가능한 원형 버튼 + 채팅창 */}
      <div
        className="fixed z-50 pointer-events-auto"
        style={{
          left: aiFabPos ? aiFabPos.x : undefined,
          top: aiFabPos ? aiFabPos.y : undefined,
          right: aiFabPos ? undefined : 80,
          bottom: aiFabPos ? undefined : 80,
        }}
      >
        {/* 채팅 패널 (버튼 위에 표시) */}
        <div
          className={`absolute bottom-14 right-0 rounded-2xl shadow-2xl border overflow-hidden flex flex-col transition-all duration-200 origin-bottom-right ${
            isAIPanelOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
          } ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
          style={{ width: aiPanelSize.w, height: aiPanelSize.h }}
        >
          {/* 좌상단 리사이즈 핸들 */}
          <div
            className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              aiResizing.current = true;
              aiResizeStart.current = { x: e.clientX, y: e.clientY, w: aiPanelSize.w, h: aiPanelSize.h };
              const onMove = (ev: MouseEvent) => {
                if (!aiResizing.current) return;
                const dw = aiResizeStart.current.x - ev.clientX;
                const dh = aiResizeStart.current.y - ev.clientY;
                setAiPanelSize({
                  w: Math.max(320, Math.min(700, aiResizeStart.current.w + dw)),
                  h: Math.max(300, Math.min(800, aiResizeStart.current.h + dh)),
                });
              };
              const onUp = () => {
                aiResizing.current = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          >
            <svg className={`w-3 h-3 m-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} viewBox="0 0 10 10" fill="currentColor">
              <circle cx="2" cy="2" r="1" />
              <circle cx="2" cy="6" r="1" />
              <circle cx="6" cy="2" r="1" />
            </svg>
          </div>
          <AIChatPanel
            modelId={modelId}
            modelInfo={notesModelInfo ? {
              name: notesModelInfo.name,
              nameKo: notesModelInfo.nameKo,
              description: notesModelInfo.description,
              theory: notesModelInfo.theory,
              category: notesModelInfo.category,
            } : null}
            selectedPart={selectedPart ? {
              name: selectedPart.name,
              nameKo: selectedPart.nameKo,
              description: selectedPart.description,
              material: (selectedPart as unknown as { material?: string }).material,
            } : null}
            user={user}
            isDarkMode={isDarkMode}
            onClose={() => setIsAIPanelOpen(false)}
          />
        </div>

        {/* 플로팅 원형 버튼 */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            aiFabDragging.current = false;
            const el = e.currentTarget.parentElement!;
            const rect = el.getBoundingClientRect();
            aiFabStartMouse.current = { x: e.clientX, y: e.clientY };
            aiFabStartPos.current = { x: rect.left, y: rect.top };

            const onMove = (ev: MouseEvent) => {
              const dx = ev.clientX - aiFabStartMouse.current.x;
              const dy = ev.clientY - aiFabStartMouse.current.y;
              if (Math.abs(dx) > 3 || Math.abs(dy) > 3) aiFabDragging.current = true;
              setAiFabPos({
                x: aiFabStartPos.current.x + dx,
                y: aiFabStartPos.current.y + dy,
              });
            };
            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
          onClick={() => {
            if (!aiFabDragging.current) setIsAIPanelOpen(prev => !prev);
          }}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-colors duration-200 ${
            isAIPanelOpen
              ? 'bg-[#001AFF] text-white shadow-blue-500/30'
              : isDarkMode
                ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                : 'bg-white text-[#001AFF] border border-gray-200 hover:bg-gray-50'
          }`}
          title="AI 어시스턴트 (드래그하여 이동)"
        >
          <span className="text-[13px] font-bold">AI</span>
        </button>
      </div>

    </div>

    {/* ══════ 로그인 모달 ══════ */}
    {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
