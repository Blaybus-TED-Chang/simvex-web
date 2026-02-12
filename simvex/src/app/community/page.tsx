'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

  const loadPage = useCallback(async (p: number, query?: string) => {
    setLoading(true);
    const { data, count } = await fetchPublicModelsPaginated(p, PAGE_SIZE, query);
    setModels(data);
    setTotalCount(count);
    setPage(p);
    setLoading(false);
  }, [fetchPublicModelsPaginated]);

  const handleSearch = useCallback(() => {
    const q = searchInput.trim();
    setActiveSearch(q);
    setSearched(true);
    loadPage(0, q);
  }, [searchInput, loadPage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setSearchInput('');
    setActiveSearch('');
    setSearched(false);
    setModels([]);
    setTotalCount(0);
    inputRef.current?.focus();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col" style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard Variable', sans-serif" }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-8 bg-white shrink-0 relative z-20" style={{ height: 72, boxShadow: '0 0 8.4px rgba(0,0,0,0.25)' }}>
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

      {/* ══════ 히어로 + 검색 ══════ */}
      {!searched && (
        <section
          className="relative flex flex-col items-center text-center shrink-0 pt-[18vh]"
          style={{ height: 'calc(100vh - 72px)' }}
        >
          {/* 배경 이미지 */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/community-hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

          {/* 콘텐츠 */}
          <div className="relative z-10 w-full max-w-2xl px-6" style={{ animation: 'fadeInUp 0.8s ease both' }}>
            <h1 className="text-[48px] font-bold text-white mb-3 tracking-tight leading-tight" style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: 56 }}>
              World
            </h1>
            <p className="text-[16px] text-white/80 mb-10 font-light">
              다른 사용자들이 공유한 3D 모델을 탐색해보세요
            </p>

            {/* 검색창 */}
            <div className="relative group" style={{ animation: 'fadeInUp 0.8s ease 0.2s both' }}>
              <div className="flex items-center bg-white rounded-full overflow-hidden transition-shadow duration-300 group-focus-within:shadow-xl" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
                <svg className="w-5 h-5 text-gray-400 ml-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="모델 이름, 카테고리 등을 검색하세요..."
                  className="flex-1 h-[56px] px-4 text-[16px] text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="h-[44px] px-7 mr-1.5 rounded-full bg-[#001AFF] text-white text-[15px] font-semibold hover:bg-[#0014CC] transition-colors shrink-0"
                >
                  검색
                </button>
              </div>
            </div>

            {/* 추천 키워드 */}
            <div className="flex items-center justify-center gap-2 mt-6" style={{ animation: 'fadeInUp 0.8s ease 0.4s both' }}>
              {['드론', '로봇', '자동차', '항공', '기계'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSearchInput(tag); setActiveSearch(tag); setSearched(true); loadPage(0, tag); }}
                  className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[13px] font-medium border border-white/20 hover:bg-white/25 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ 검색 결과 ══════ */}
      {searched && (
        <div className="flex-1 flex flex-col">
          {/* 상단 검색바 (고정) */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="flex-1 relative flex items-center bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-200 focus-within:border-[#001AFF] focus-within:bg-white transition-all">
                <svg className="w-5 h-5 text-gray-400 ml-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="모델 이름, 카테고리 등을 검색하세요..."
                  className="flex-1 h-[46px] px-3 text-[15px] text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
                {searchInput && (
                  <button onClick={handleClear} className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="h-[36px] px-5 mr-1.5 rounded-full bg-[#001AFF] text-white text-[14px] font-semibold hover:bg-[#0014CC] transition-colors shrink-0"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 결과 영역 */}
          <div className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
            {/* 결과 요약 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[14px] text-gray-500">
                  {activeSearch ? (
                    <>&apos;<span className="font-semibold text-gray-900">{activeSearch}</span>&apos; 검색 결과 <span className="font-semibold text-[#001AFF]">{totalCount}</span>건</>
                  ) : (
                    <>전체 공개 모델 <span className="font-semibold text-[#001AFF]">{totalCount}</span>건</>
                  )}
                </p>
              </div>
              {user && (
                <Link href="/upload" className="text-[13px] font-medium text-gray-400 hover:text-[#001AFF] transition-colors">
                  내 모델 업로드
                </Link>
              )}
            </div>

            {/* 로딩 */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-[3px] border-[#001AFF] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[14px] text-gray-400">모델을 검색하고 있어요...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-[16px] font-semibold text-gray-700 mb-1">검색 결과가 없습니다</p>
                <p className="text-[14px] text-gray-400">다른 키워드로 검색해보세요</p>
                <button
                  onClick={handleClear}
                  className="mt-4 px-5 py-2 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  검색 초기화
                </button>
              </div>
            ) : (
              <>
                {/* 모델 그리드 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {models.map((model, idx) => {
                    const thumbnailUrl = model.thumbnail_storage_path
                      ? getPublicUrl(model.thumbnail_storage_path)
                      : null;
                    const partsCount = (model.parts_config as unknown[]).length;

                    return (
                      <Link
                        key={model.id}
                        href={`/viewer/u-${model.id}`}
                        className="group"
                        style={{ animation: `fadeInUp 0.4s ease ${idx * 0.05}s both` }}
                      >
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1">
                          {/* 썸네일 */}
                          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                            {thumbnailUrl ? (
                              <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* 콘텐츠 */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors truncate">
                                {model.name}
                              </h4>
                              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-[#001AFF] shrink-0">
                                {partsCount}개 부품
                              </span>
                            </div>
                            <p className="text-[12px] text-gray-500 mb-2">{model.category}</p>
                            <p className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed">
                              {model.description || '설명 없음'}
                            </p>
                          </div>

                          {/* 스크랩 + 공유 */}
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <ScrapButton
                              user={user}
                              isScraped={isScraped('user', model.id)}
                              scrapInput={{ model_type: 'user', model_id: model.id, user_model_id: model.id }}
                              onToggle={toggleScrap}
                              isDarkMode={false}
                              size="sm"
                              onLoginRequired={() => setShowLogin(true)}
                            />
                            <ShareButton
                              modelId={`u-${model.id}`}
                              isDarkMode={false}
                              size="sm"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => loadPage(page - 1, activeSearch)}
                      disabled={page === 0}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                        page === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => loadPage(i, activeSearch)}
                        className={`w-9 h-9 rounded-full text-[13px] font-semibold transition-all ${
                          page === i ? 'bg-[#001AFF] text-white' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => loadPage(page + 1, activeSearch)}
                      disabled={page >= totalPages - 1}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                        page >= totalPages - 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 푸터 */}
          <footer className="px-8 py-6 border-t border-gray-100 mt-auto">
            <div className="max-w-6xl mx-auto flex items-center justify-between text-[12px] text-gray-400">
              <p>SIMVEX - 공학 학습 플랫폼</p>
              <p>교육과 탐구를 위해 만들어졌습니다</p>
            </div>
          </footer>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
