'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useViewerStore } from '@/lib/store/viewerStore';
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
  const [originalFbxBlob, setOriginalFbxBlob] = useState<Blob | null>(null);
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
    setOriginalFbxBlob(null);
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
          setOriginalFbxBlob(file);
          const buffer = await file.arrayBuffer();
          blob = await convertFbxToGlb(buffer);
        } else {
          setOriginalFbxBlob(null);
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
          fbxBlob: originalFbxBlob ?? undefined,
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
    setOriginalFbxBlob(null);
  }, []);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const inputClass = 'w-full px-4 py-2.5 text-[14px] rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#001AFF] focus:ring-1 focus:ring-[#001AFF]/20 transition-all';
  const labelClass = 'block text-[13px] font-semibold mb-1.5 text-gray-600';
  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자';

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard Variable', sans-serif" }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-8 bg-white shrink-0 relative z-10" style={{ height: 72, boxShadow: '0 0 8.4px rgba(0,0,0,0.25)' }}>
        <Link href="/" className="text-[26px] text-black no-underline shrink-0" style={{ fontFamily: 'Righteous', fontWeight: 400 }}>
          SIMVEX
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/models" className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all" title="홈">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </Link>
          {user && (
            <Link href="/mypage" className="flex items-center gap-2.5 shrink-0 rounded-full px-2 py-1.5 -mx-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97] cursor-pointer">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url as string} alt="프로필" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[14px] font-medium text-gray-700">{displayName}</span>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10 space-y-12">

        {/* ── 페이지 타이틀 ── */}
        <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">모델 업로드</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">3D 모델을 업로드하고 분해 설정을 구성하세요</p>
            </div>
          </div>
        </div>

        {/* ── 내 모델 섹션 ── */}
        <section style={{ animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">내 모델</h2>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[12px] font-semibold text-gray-500">{models.length}</span>
          </div>
          <MyModelGrid
            models={models}
            loading={modelsLoading}
            isDarkMode={false}
            onEdit={handleEdit}
            onDelete={deleteModel}
            onTogglePublic={togglePublic}
          />
        </section>

        {/* ── 업로드 섹션 ── */}
        <section style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
                {editingModel ? '모델 수정' : '새 모델 업로드'}
              </h2>
              {editingModel && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[12px] font-semibold">수정 중</span>
              )}
            </div>
            {(step !== 'idle' || editingModel) && (
              <button
                onClick={resetForm}
                className="px-4 py-2 text-[13px] font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                취소
              </button>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-5 px-5 py-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[14px] flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* 파일 선택 (신규 업로드 시만) */}
          {!editingModel && (
            <FileDropzone
              onFileSelected={handleFileSelected}
              isDarkMode={false}
              disabled={step === 'processing' || step === 'uploading'}
              currentFileName={fileName}
            />
          )}

          {/* 처리 중 */}
          {step === 'processing' && (
            <div className="mt-8 text-center py-12">
              <div className="w-12 h-12 border-[3px] border-[#001AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[15px] text-gray-500 font-medium">파일을 분석하고 있어요...</p>
              <p className="text-[13px] text-gray-400 mt-1">부품 자동 감지 및 분해 설정을 생성합니다</p>
            </div>
          )}

          {/* 설정 단계 */}
          {(step === 'configure' || step === 'uploading') && glbUrl && (
            <div className="mt-6 flex gap-8" style={{ height: 'calc(100vh - 14rem)' }}>
              {/* 좌: 렌더링 + 입력폼 */}
              <div className="w-1/2 flex-shrink-0 flex flex-col gap-5 overflow-hidden">
                {/* 3D 미리보기 */}
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-gray-200" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <ModelPreview
                    glbUrl={glbUrl}
                    parts={parts}
                    scale={scale}
                    cameraPosition={cameraPosition}
                    cameraTarget={cameraTarget}
                    isDarkMode={false}
                    selectedPartId={selectedPartId}
                    onSelectPart={setSelectedPartId}
                  />
                </div>

                {/* 모델 정보 입력 */}
                <div className="flex-shrink-0 space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFBFC] p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="grid grid-cols-2 gap-4">
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
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
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

                  <div className="flex items-center gap-4 pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-[22px] bg-gray-300 peer-checked:bg-[#001AFF] rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-sm peer-checked:after:translate-x-[18px]" />
                    </label>
                    <span className="text-[13px] text-gray-600 font-medium">커뮤니티에 공개</span>

                    <button
                      onClick={handleSubmit}
                      disabled={step === 'uploading' || !name.trim()}
                      className={`ml-auto px-7 py-2.5 rounded-full font-semibold text-[14px] transition-all ${
                        step === 'uploading' || !name.trim()
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#001AFF] hover:bg-[#0014CC] text-white shadow-sm hover:shadow-md'
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

              {/* 우: 부품 설정 */}
              <div className="w-1/2 overflow-y-auto pr-1 rounded-2xl border border-gray-200 bg-[#FAFBFC] p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <PartConfigEditor
                  parts={parts}
                  onChange={setParts}
                  isDarkMode={false}
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
