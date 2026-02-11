'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useScraps } from '@/hooks/useScraps';
import { useViewerStore } from '@/lib/store/viewerStore';
import { LoginModal } from '@/components/auth/LoginModal';
import { ScrapButton } from '@/components/scrap/ScrapButton';
import { ShareButton } from '@/components/share/ShareButton';
import type { UserModelRow } from '@/types/userModel';

const PAGE_SIZE = 12;

export default function CommunityPage() {
  const { user } = useUser();
  const { isDarkMode } = useViewerStore();
  const { fetchPublicModelsPaginated } = useUserModels(user);
  const { isScraped, toggleScrap } = useScraps(user);

  const [showLogin, setShowLogin] = useState(false);
  const [models, setModels] = useState<UserModelRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Zustand store hydration
  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    const { data, count } = await fetchPublicModelsPaginated(p, PAGE_SIZE);
    setModels(data);
    setTotalCount(count);
    setPage(p);
    setLoading(false);
  }, [fetchPublicModelsPaginated]);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
          {user ? (
            <Link href="/mypage" className="flex items-center gap-2.5 shrink-0 rounded-full px-2 py-1.5 -mx-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97] cursor-pointer">
              {(user.user_metadata?.avatar_url) ? (
                <img src={user.user_metadata.avatar_url as string} alt="프로필" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold shadow-inner">
                  {(user.user_metadata?.name || user.email?.split('@')[0] || '사').toString().charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[14px] font-medium text-gray-700">
                {(user.user_metadata?.name || user.email?.split('@')[0] || '사용자') as string}
              </span>
            </Link>
          ) : (
            <Link href="/auth/login" className="shrink-0 px-5 py-2 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              로그인
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 타이틀 */}
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            커뮤니티 모델
          </h2>
          {user && (
            <Link
              href="/upload"
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-gray-100'
              }`}
            >
              내 모델 관리
            </Link>
          )}
        </div>
        <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          사용자들이 업로드한 공개 3D 모델 ({totalCount}개)
        </p>

        {/* 로딩 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : models.length === 0 ? (
          <div className={`text-center py-20 rounded-xl border ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
            <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              아직 공개된 커뮤니티 모델이 없습니다
            </p>
            {user && (
              <Link
                href="/upload"
                className={`inline-block mt-3 text-sm px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-purple-400 hover:bg-gray-800' : 'text-purple-600 hover:bg-gray-100'
                }`}
              >
                첫 모델 업로드하기
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* 모델 그리드 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => {
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
                        ? 'border-purple-800/50 bg-gray-900/50 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10'
                        : 'border-purple-200 bg-white shadow-sm hover:border-purple-400 hover:shadow-lg'
                    }`}>
                      {/* 썸네일 */}
                      <div className={`aspect-video flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                      }`}>
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 콘텐츠 */}
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

                      {/* 카테고리 + 스크랩 + 공유 */}
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <ScrapButton
                          user={user}
                          isScraped={isScraped('user', model.id)}
                          scrapInput={{ model_type: 'user', model_id: model.id, user_model_id: model.id }}
                          onToggle={toggleScrap}
                          isDarkMode={isDarkMode}
                          size="sm"
                          onLoginRequired={() => setShowLogin(true)}
                        />
                        <ShareButton
                          modelId={`u-${model.id}`}
                          isDarkMode={isDarkMode}
                          size="sm"
                        />
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => loadPage(page - 1)}
                  disabled={page === 0}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    page === 0
                      ? isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  이전
                </button>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => loadPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    page >= totalPages - 1
                      ? isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 푸터 */}
      <footer className={`px-6 py-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className={`max-w-6xl mx-auto flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>SIMVEX - 공학 학습 플랫폼</p>
          <p>교육과 탐구를 위해 만들어졌습니다</p>
        </div>
      </footer>

      {/* ══════ 로그인 모달 ══════ */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
