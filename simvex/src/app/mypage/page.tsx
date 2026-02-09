'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { useScraps } from '@/hooks/useScraps';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useViewerStore } from '@/lib/store/viewerStore';
import { AuthButton } from '@/components/auth/AuthButton';
import { getCombinedModelById, getModelById } from '@/data/models';
import { suspensionModel } from '@/data/models/suspension';
import { createClient } from '@/lib/supabase/client';
import type { UserModelRow } from '@/types/userModel';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { isDarkMode, toggleDarkMode } = useViewerStore();
  const { scraps, loaded: scrapsLoaded, toggleScrap } = useScraps(user);
  const { models: myModels, loading: modelsLoading } = useUserModels(user);
  const [scrapUserModels, setScrapUserModels] = useState<UserModelRow[]>([]);

  // Zustand store hydration
  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

  // 미로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, userLoading, router]);

  // 스크랩한 user 모델 정보 조회
  const fetchScrapUserModels = useCallback(async () => {
    const userScraps = scraps.filter((s) => s.model_type === 'user');
    if (userScraps.length === 0) {
      setScrapUserModels([]);
      return;
    }
    const ids = userScraps.map((s) => s.model_id);
    const supabase = createClient();
    const { data } = await supabase
      .from('user_models')
      .select('*')
      .in('id', ids);
    setScrapUserModels(data ?? []);
  }, [scraps]);

  useEffect(() => {
    if (scrapsLoaded) {
      fetchScrapUserModels();
    }
  }, [scrapsLoaded, fetchScrapUserModels]);

  // 스크랩한 builtin 모델 정보 가져오기
  const builtinScraps = scraps.filter((s) => s.model_type === 'builtin');
  const builtinModels = builtinScraps.map((s) => {
    const combined = getCombinedModelById(s.model_id);
    if (combined) return { type: 'combined' as const, model: combined, scrapId: s.id };
    const regular = getModelById(s.model_id);
    if (regular) return { type: 'regular' as const, model: regular, scrapId: s.id };
    // suspension 등 직접 참조 모델
    if (s.model_id === suspensionModel.id) return { type: 'regular' as const, model: suspensionModel, scrapId: s.id };
    return null;
  }).filter(Boolean) as Array<{ type: 'combined' | 'regular'; model: { id: string; name: string; nameKo: string; description: string; category: string; thumbnail?: string; thumbnails?: string[]; parts: { id: string }[] }; scrapId: string }>;

  // 로딩 중
  if (userLoading || !user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userScrapModels = scraps.filter((s) => s.model_type === 'user');
  const totalScraps = builtinModels.length + userScrapModels.length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* 헤더 */}
      <header className={`h-14 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b px-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Link
            href="/models"
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="SIMVEX" width={90} height={19} className={`object-contain ${isDarkMode ? 'invert' : ''}`} />
            <h1 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>마이페이지</h1>
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

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* 사용자 정보 */}
        <section>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <svg className={`w-7 h-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.email}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                스크랩 {totalScraps}개 · 내 모델 {myModels.length}개
              </p>
            </div>
          </div>
        </section>

        {/* 스크랩한 모델 섹션 */}
        <section>
          <h2 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            스크랩한 모델
          </h2>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            즐겨찾기한 3D 모델
          </p>

          {!scrapsLoaded ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : totalScraps === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
              <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                아직 스크랩한 모델이 없습니다
              </p>
              <Link
                href="/models"
                className={`inline-block mt-3 text-sm px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-gray-100'
                }`}
              >
                모델 둘러보기
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* builtin 모델 */}
              {builtinModels.map(({ type, model }) => (
                <Link
                  key={model.id}
                  href={`/viewer/${model.id}`}
                  className="group"
                >
                  <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    isDarkMode
                      ? 'border-green-800/50 bg-gray-900/50 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10'
                      : 'border-green-200 bg-white shadow-sm hover:border-green-400 hover:shadow-lg'
                  }`}>
                    <div className={`aspect-video flex items-center justify-center ${
                      isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }`}>
                      {model.thumbnails && model.thumbnails.length > 0 ? (
                        <Image src={model.thumbnails[0]} alt={model.nameKo} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      ) : model.thumbnail ? (
                        <Image src={model.thumbnail} alt={model.nameKo} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold transition-colors ${
                          isDarkMode ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600'
                        }`}>
                          {model.nameKo}
                        </h4>
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                        }`}>
                          {model.parts.length}개 부품
                        </span>
                      </div>
                      <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {model.description}
                      </p>
                    </div>
                    {/* 스크랩 해제 + 카테고리 */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleScrap({ model_type: 'builtin', model_id: model.id });
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-400 transition-colors"
                        title="스크랩 해제"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        isDarkMode ? 'bg-gray-800/80 backdrop-blur text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {model.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* user 모델 */}
              {scrapUserModels.map((model) => {
                const thumbnailUrl = model.thumbnail_storage_path
                  ? getPublicUrl(model.thumbnail_storage_path)
                  : null;
                const partsCount = (model.parts_config as unknown[]).length;

                return (
                  <Link
                    key={model.id}
                    href={`/viewer/u-${model.id}`}
                    className="group"
                  >
                    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'border-purple-800/50 bg-gray-900/50 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10'
                        : 'border-purple-200 bg-white shadow-sm hover:border-purple-400 hover:shadow-lg'
                    }`}>
                      <div className={`aspect-video flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                      }`}>
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold transition-colors ${
                            isDarkMode ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'
                          }`}>
                            {model.name}
                          </h4>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {partsCount}개 부품
                          </span>
                        </div>
                        <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {model.description || '설명 없음'}
                        </p>
                      </div>
                      {/* 스크랩 해제 + 카테고리 */}
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleScrap({ model_type: 'user', model_id: model.id, user_model_id: model.id });
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-400 transition-colors"
                          title="스크랩 해제"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          isDarkMode ? 'bg-gray-800/80 backdrop-blur text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {model.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* 내 업로드 모델 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              내 업로드 모델
            </h2>
            <Link
              href="/upload"
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-gray-100'
              }`}
            >
              모델 업로드
            </Link>
          </div>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            내가 업로드한 3D 모델
          </p>

          {modelsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myModels.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
              <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                아직 업로드한 모델이 없습니다
              </p>
              <Link
                href="/upload"
                className={`inline-block mt-3 text-sm px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-gray-100'
                }`}
              >
                모델 업로드하기
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myModels.map((model) => {
                const thumbnailUrl = model.thumbnail_storage_path
                  ? getPublicUrl(model.thumbnail_storage_path)
                  : null;
                const partsCount = (model.parts_config as unknown[]).length;

                return (
                  <Link
                    key={model.id}
                    href={`/viewer/u-${model.id}`}
                    className="group"
                  >
                    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                      isDarkMode
                        ? 'border-blue-800/50 bg-gray-900/50 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10'
                        : 'border-blue-200 bg-white shadow-sm hover:border-blue-400 hover:shadow-lg'
                    }`}>
                      <div className={`aspect-video flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                      }`}>
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold transition-colors ${
                            isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'
                          }`}>
                            {model.name}
                          </h4>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {partsCount}개 부품
                          </span>
                        </div>
                        <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {model.description || '설명 없음'}
                        </p>
                      </div>
                      {/* 공개/비공개 + 카테고리 */}
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {model.is_public ? (
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                          }`}>
                            공개
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            isDarkMode ? 'bg-gray-800/80 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            비공개
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          isDarkMode ? 'bg-gray-800/80 backdrop-blur text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {model.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 푸터 */}
      <footer className={`px-6 py-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className={`max-w-6xl mx-auto flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>SIMVEX - 공학 학습 플랫폼</p>
          <p>교육과 탐구를 위해 만들어졌습니다</p>
        </div>
      </footer>
    </div>
  );
}
