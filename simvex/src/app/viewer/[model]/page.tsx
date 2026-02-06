'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
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
import { DebugPanel } from '@/components/viewer/DebugPanel';
import { AuthButton } from '@/components/auth/AuthButton';
import { QuizPanel } from '@/components/quiz/QuizPanel';
import { ExportPdfButton } from '@/components/export/ExportPdfButton';
import { useUser } from '@/hooks/useUser';
import { PartConfig, ModelConfig } from '@/types/viewer';
import { CombinedModelConfig, CombinedPartConfig } from '@/components/viewer/CombinedGLBPart';
import { createClient } from '@/lib/supabase/client';
import { userModelToConfig } from '@/types/userModel';
import { getQuizByModelId, hasQuiz } from '@/data/quizzes';

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

  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [notesPanelWidth, setNotesPanelWidth] = useState(384); // 기본 w-96 = 384px
  const [sidebarWidth, setSidebarWidth] = useState(320); // 기본 w-80 = 320px
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

  // 디버그용 오버라이드 상태
  const [partOverrides, setPartOverrides] = useState<Map<string, Partial<PartConfig>>>(new Map());
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>(
    originalModel?.cameraPosition || combinedModel?.cameraPosition || [5, 3, 5]
  );
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>(
    originalModel?.cameraTarget || combinedModel?.cameraTarget || [0, 0, 0]
  );

  // 오버라이드가 적용된 일반 모델 생성
  const model: ModelConfig | undefined = originalModel ? {
    ...originalModel,
    parts: originalModel.parts.map(part => {
      const overrides = partOverrides.get(part.id);
      return overrides ? { ...part, ...overrides } : part;
    })
  } : undefined;

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

  // 부품 업데이트 핸들러
  const handleUpdatePart = useCallback((partId: string, updates: Partial<PartConfig>) => {
    setPartOverrides(prev => {
      const next = new Map(prev);
      const existing = next.get(partId) || {};
      next.set(partId, { ...existing, ...updates });
      return next;
    });
  }, []);

  // 카메라 업데이트 핸들러
  const handleUpdateCamera = useCallback((position: [number, number, number], target: [number, number, number]) => {
    setCameraPosition(position);
    setCameraTarget(target);
    saveModelStateDebounced(position, target);
  }, [saveModelStateDebounced]);

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

  // 모델이 없으면 에러 페이지
  if (!currentModelInfo) {
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

  // 선택된 부품 찾기
  const selectedPart = currentModelInfo.parts.find((p) => p.id === selectedPartId) || null;

  return (
    <div className={`viewer-page min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      {/* 헤더 */}
      <header className={`h-14 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

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
                {currentModelInfo.nameKo}
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentModelInfo.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthButton />

          {/* PDF 내보내기 버튼 */}
          <ExportPdfButton
            modelNameKo={currentModelInfo.nameKo}
            modelName={currentModelInfo.name}
            description={currentModelInfo.description}
            theory={currentModelInfo.theory}
            parts={currentModelInfo.parts.map((p) => ({
              nameKo: p.nameKo,
              name: p.name,
              description: p.description,
            }))}
            notes={notes}
            isDarkMode={isDarkMode}
          />

          {/* 퀴즈 버튼 */}
          {modelHasQuiz && (
            <button
              onClick={() => setIsQuizPanelOpen(!isQuizPanelOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isQuizPanelOpen
                  ? 'bg-green-500 text-white'
                  : isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="퀴즈"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          )}

          {/* 디버그 모드 토글 */}
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`p-2 rounded-lg transition-colors ${
              debugMode
                ? 'bg-purple-500 text-white'
                : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Debug Mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* 노트 패널 토글 */}
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

          {/* 다크모드 토글 */}
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
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
        {/* 3D 뷰포트 */}
        <div className="flex-1 min-w-0 p-4">
          {isCombinedModel && combinedModel ? (
            <CombinedModelViewer
              model={combinedModel}
              explodeValue={explodeValue}
              selectedPartId={selectedPartId}
              hoveredPartId={hoveredPartId}
              visibleParts={visibleParts}
              onSelectPart={setSelectedPartId}
              onHoverPart={setHoveredPartId}
              cameraPosition={cameraPosition}
              cameraTarget={cameraTarget}
              isDarkMode={isDarkMode}
              onCameraChange={handleUpdateCamera}
            />
          ) : model ? (
            <ModelViewer
              model={model}
              debugMode={debugMode}
              overrideParts={partOverrides}
              cameraPosition={cameraPosition}
              cameraTarget={cameraTarget}
            />
          ) : null}
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
          <ProductInfo model={currentModelInfo} />

          {/* 부품 정보 */}
          <PartInfo part={selectedPart} />

          {/* 부품 목록 */}
          <PartsList parts={currentModelInfo.parts} />
        </div>

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
            <NotesPanel
              modelInfo={currentModelInfo}
              selectedPart={selectedPart}
              user={user}
              modelId={modelId}
            />
          </div>
        </div>

        {/* 퀴즈 패널 (슬라이드) */}
        {quiz && (
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
      </div>

      {/* 디버그 패널 (일반 모델만 지원) */}
      {debugMode && model && !isCombinedModel && (
        <DebugPanel
          model={model}
          onUpdatePart={handleUpdatePart}
          onUpdateCamera={handleUpdateCamera}
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
        />
      )}
    </div>
  );
}
