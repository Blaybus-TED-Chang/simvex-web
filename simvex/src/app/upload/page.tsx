'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useViewerStore } from '@/lib/store/viewerStore';
import { AuthButton } from '@/components/auth/AuthButton';
import { FileDropzone } from '@/components/upload/FileDropzone';
import { ModelPreview } from '@/components/upload/ModelPreview';
import { PartConfigEditor } from '@/components/upload/PartConfigEditor';
import { MyModelGrid } from '@/components/upload/MyModelGrid';
import { generateExplodeConfig } from '@/lib/upload/autoExplodeConfig';
import { convertFbxToGlb } from '@/lib/upload/fbxToGlb';
import { MODEL_CATEGORIES, type UserModelPartConfig, type UserModelRow } from '@/types/userModel';

type UploadStep = 'idle' | 'processing' | 'configure' | 'uploading';

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { isDarkMode, toggleDarkMode } = useViewerStore();
  const { models, loading: modelsLoading, uploadModel, updateModel, deleteModel, togglePublic } = useUserModels(user);

  // Zustand hydration
  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

  // 업로드 상태
  const [step, setStep] = useState<UploadStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [glbBlob, setGlbBlob] = useState<Blob | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // 폼 상태
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('기타');
  const [customCategory, setCustomCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [scale, setScale] = useState(1);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([5, 3, 5]);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [parts, setParts] = useState<UserModelPartConfig[]>([]);

  // 수정 모드
  const [editingModel, setEditingModel] = useState<UserModelRow | null>(null);

  // 로그인 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // 폼 리셋
  const resetForm = useCallback(() => {
    setStep('idle');
    setError(null);
    setFileName('');
    if (glbUrl) URL.revokeObjectURL(glbUrl);
    setGlbBlob(null);
    setGlbUrl(null);
    setSelectedPartId(null);
    setName('');
    setDescription('');
    setCategory('기타');
    setCustomCategory('');
    setIsPublic(false);
    setScale(1);
    setCameraPosition([5, 3, 5]);
    setCameraTarget([0, 0, 0]);
    setParts([]);
    setEditingModel(null);
  }, [glbUrl]);

  // 파일 선택 처리
  const handleFileSelected = useCallback(
    async (file: File) => {
      setStep('processing');
      setError(null);
      setFileName(file.name);

      try {
        let blob: Blob;
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'fbx') {
          const buffer = await file.arrayBuffer();
          blob = await convertFbxToGlb(buffer);
        } else {
          blob = file;
        }

        setGlbBlob(blob);
        const url = URL.createObjectURL(blob);
        setGlbUrl(url);

        // 자동 분해 설정 생성
        const { parts: autoParts } = await generateExplodeConfig(blob);
        setParts(autoParts);

        // 파일명을 모델 이름 기본값으로
        if (!name) {
          const baseName = file.name.replace(/\.(glb|fbx)$/i, '');
          setName(baseName);
        }

        setStep('configure');
      } catch (err) {
        setError(err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다');
        setStep('idle');
      }
    },
    [name]
  );

  // 업로드/저장
  const handleSubmit = useCallback(async () => {
    if (!glbBlob || !user) return;
    if (!name.trim()) {
      setError('모델 이름을 입력해주세요');
      return;
    }

    setStep('uploading');
    setError(null);

    try {
      const finalCategory = category === '기타' && customCategory.trim() ? customCategory.trim() : category;

      if (editingModel) {
        // 수정 모드
        await updateModel(editingModel.id, {
          name: name.trim(),
          description: description.trim(),
          category: finalCategory,
          isPublic,
          partsConfig: parts,
          scale,
          cameraPosition,
          cameraTarget,
        });
      } else {
        // 신규 업로드
        // 썸네일 캡처 시도
        let thumbnailBlob: Blob | undefined;
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        if (canvas) {
          try {
            const { captureCanvasThumbnail } = await import('@/lib/upload/thumbnailCapture');
            thumbnailBlob = await captureCanvasThumbnail(canvas);
          } catch {
            // 썸네일 실패해도 계속 진행
          }
        }

        const result = await uploadModel({
          glbBlob,
          thumbnailBlob,
          name: name.trim(),
          description: description.trim(),
          category: finalCategory,
          isPublic,
          partsConfig: parts,
          scale,
          cameraPosition,
          cameraTarget,
        });

        // 업로드 후 뷰어로 이동
        router.push(`/viewer/u-${result.id}`);
        return;
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
      setStep('configure');
    }
  }, [
    glbBlob, user, name, description, category, customCategory, isPublic,
    parts, scale, cameraPosition, cameraTarget, editingModel,
    uploadModel, updateModel, resetForm, router,
  ]);

  // 수정 모드 진입
  const handleEdit = useCallback((model: UserModelRow) => {
    setEditingModel(model);
    setName(model.name);
    setDescription(model.description);
    setCategory(MODEL_CATEGORIES.includes(model.category as never) ? model.category : '기타');
    if (!MODEL_CATEGORIES.includes(model.category as never)) {
      setCustomCategory(model.category);
    }
    setIsPublic(model.is_public);
    setScale(model.scale ?? 1);
    setCameraPosition((model.camera_position as [number, number, number]) ?? [5, 3, 5]);
    setCameraTarget((model.camera_target as [number, number, number]) ?? [0, 0, 0]);
    setParts(model.parts_config ?? []);
    setStep('configure');

    // 기존 GLB URL 사용
    const url = getPublicUrl(model.glb_storage_path);
    setGlbUrl(url);
    setGlbBlob(null); // 수정 시 새 파일 없음
  }, []);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const inputClass = `w-full px-3 py-2 text-sm rounded-lg border ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
            <h1 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              모델 업로드
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AuthButton />
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* 내 모델 섹션 */}
        <section>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            내 모델
          </h2>
          <MyModelGrid
            models={models}
            loading={modelsLoading}
            isDarkMode={isDarkMode}
            onEdit={handleEdit}
            onDelete={deleteModel}
            onTogglePublic={togglePublic}
          />
        </section>

        {/* 업로드 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingModel ? '모델 수정' : '새 모델 업로드'}
            </h2>
            {(step !== 'idle' || editingModel) && (
              <button
                onClick={resetForm}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                취소
              </button>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 파일 선택 (신규 업로드 시만) */}
          {!editingModel && (
            <FileDropzone
              onFileSelected={handleFileSelected}
              isDarkMode={isDarkMode}
              disabled={step === 'processing' || step === 'uploading'}
              currentFileName={fileName}
            />
          )}

          {/* 처리 중 */}
          {step === 'processing' && (
            <div className="mt-6 text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>파일 분석 중...</p>
            </div>
          )}

          {/* 설정 단계: 좌(렌더링+폼 고정) / 우(부품설정 스크롤) */}
          {(step === 'configure' || step === 'uploading') && glbUrl && (
            <div className="mt-6 flex gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
              {/* 좌: 렌더링(상) + 입력폼(하) — 고정 */}
              <div className="w-1/2 flex-shrink-0 flex flex-col gap-4 overflow-hidden">
                {/* 3D 미리보기 */}
                <div className="flex-1 min-h-0">
                  <ModelPreview
                    glbUrl={glbUrl}
                    parts={parts}
                    scale={scale}
                    cameraPosition={cameraPosition}
                    cameraTarget={cameraTarget}
                    isDarkMode={isDarkMode}
                    selectedPartId={selectedPartId}
                    onSelectPart={setSelectedPartId}
                  />
                </div>

                {/* 모델 정보 입력 */}
                <div className="flex-shrink-0 space-y-3 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>모델 이름 *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: V4 엔진"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>카테고리</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={inputClass}
                      >
                        {MODEL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {category === '기타' && (
                    <div>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="카테고리 직접 입력"
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>설명</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="모델에 대한 간단한 설명"
                      rows={2}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className={labelClass}>스케일</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.01"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>카메라 X</label>
                      <input
                        type="number"
                        step="0.5"
                        value={cameraPosition[0]}
                        onChange={(e) => setCameraPosition([parseFloat(e.target.value) || 0, cameraPosition[1], cameraPosition[2]])}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>카메라 Y</label>
                      <input
                        type="number"
                        step="0.5"
                        value={cameraPosition[1]}
                        onChange={(e) => setCameraPosition([cameraPosition[0], parseFloat(e.target.value) || 0, cameraPosition[2]])}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>카메라 Z</label>
                      <input
                        type="number"
                        step="0.5"
                        value={cameraPosition[2]}
                        onChange={(e) => setCameraPosition([cameraPosition[0], cameraPosition[1], parseFloat(e.target.value) || 0])}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-checked:bg-green-500 rounded-full peer-focus:ring-2 peer-focus:ring-green-500/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      커뮤니티에 공개
                    </span>

                    <button
                      onClick={handleSubmit}
                      disabled={step === 'uploading' || !name.trim()}
                      className={`ml-auto px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                        step === 'uploading' || !name.trim()
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {step === 'uploading' ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          업로드 중...
                        </span>
                      ) : editingModel ? '수정 저장' : '업로드'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 우: 부품 설정 — 독립 스크롤 */}
              <div className="w-1/2 overflow-y-auto pr-1">
                <PartConfigEditor
                  parts={parts}
                  onChange={setParts}
                  isDarkMode={isDarkMode}
                  selectedPartId={selectedPartId}
                  onSelectPart={setSelectedPartId}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
