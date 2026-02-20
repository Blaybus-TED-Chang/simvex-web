'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useViewerStore } from '@/lib/store/viewerStore';
import { WorkflowList } from '@/components/workflow/WorkflowList';

export default function WorkflowListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { isDarkMode } = useViewerStore();
  const {
    workflows,
    savedWorkflows,
    loading,
    fetchMyWorkflows,
    fetchSavedWorkflows,
    createWorkflow,
    deleteWorkflow,
    removeSavedWorkflow,
  } = useWorkflows(user);

  const [tab, setTab] = useState<'my' | 'saved'>('my');

  useEffect(() => { useViewerStore.persist.rehydrate(); }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchMyWorkflows();
      fetchSavedWorkflows();
    }
  }, [user, fetchMyWorkflows, fetchSavedWorkflows]);

  const handleCreate = async () => {
    const id = await createWorkflow();
    if (id) router.push(`/workflow/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('워크플로우를 삭제하시겠습니까?')) return;
    await deleteWorkflow(id);
  };

  const handleRemoveSaved = async (id: string) => {
    await removeSavedWorkflow(id);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const currentList = tab === 'my' ? workflows : savedWorkflows;

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ══════ 상단 헤더 ══════ */}
      <header className="flex items-center justify-between px-8 bg-white shrink-0 relative z-10" style={{ height: 72, boxShadow: '0 0 8.4px rgba(0,0,0,0.25)' }}>
        <Link href="/" className="text-[26px] text-black no-underline shrink-0" style={{ fontFamily: 'Righteous', fontWeight: 400 }}>
          VEXA
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <Link href="/mypage" className="flex items-center gap-2.5 shrink-0 rounded-full px-2 py-1.5 -mx-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97] cursor-pointer">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="프로필" className="w-9 h-9 rounded-full object-cover" />
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

      {/* ══════ 메인 영역 ══════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══════ 사이드바 ══════ */}
        <aside className="w-[240px] flex flex-col justify-between bg-[#F8FAFF] shrink-0" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
          <nav className="flex flex-col gap-1 px-4 pt-6">
            <Link href="/models"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-[#001AFF] hover:text-white transition-all duration-200">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              홈
            </Link>
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-medium bg-[#001AFF] text-white">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              워크플로우
            </div>
            <Link href="/upload"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-[#001AFF] hover:text-white transition-all duration-200">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              모델 업로드
            </Link>
            <Link href="/community"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-[#001AFF] hover:text-white transition-all duration-200">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              World
            </Link>
          </nav>

          <div className="px-5 pb-6">
            <div className="text-[11px] text-gray-400 leading-relaxed">
              <p>@VEXA Corp.</p>
            </div>
          </div>
        </aside>

        {/* ══════ 메인 콘텐츠 ══════ */}
        <main className="flex-1 overflow-y-auto" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
          <div className="px-10 pt-10 pb-14">

            {/* 페이지 헤더 */}
            <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease both' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#001AFF] to-[#4D6AFF] flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">워크플로우</h1>
                  <p className="text-[14px] text-gray-400 mt-0.5">노드 기반 플로우 차트로 학습 내용을 정리하세요</p>
                </div>
              </div>
            </div>

            {/* 탭 + 새 워크플로우 버튼 */}
            <div className="flex items-center justify-between mb-6" style={{ animation: 'fadeInUp 0.5s ease 0.1s both' }}>
              <div className="flex bg-gray-100/80 rounded-xl p-1">
                <button
                  onClick={() => setTab('my')}
                  className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                    tab === 'my'
                      ? 'bg-white text-[#001AFF] shadow-sm shadow-gray-200/50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  내 워크플로우
                  <span className={`ml-1.5 text-[12px] ${tab === 'my' ? 'text-[#001AFF]/60' : 'text-gray-300'}`}>
                    {workflows.length}
                  </span>
                </button>
                <button
                  onClick={() => setTab('saved')}
                  className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                    tab === 'saved'
                      ? 'bg-white text-[#001AFF] shadow-sm shadow-gray-200/50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  공유받은 워크플로우
                  <span className={`ml-1.5 text-[12px] ${tab === 'saved' ? 'text-[#001AFF]/60' : 'text-gray-300'}`}>
                    {savedWorkflows.length}
                  </span>
                </button>
              </div>

              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[#001AFF] hover:bg-[#0015D4] transition-all duration-200 shadow-lg shadow-[#001AFF]/20 hover:shadow-[#001AFF]/30 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 워크플로우
              </button>
            </div>

            {/* 목록 */}
            <div style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[13px] text-gray-400">불러오는 중...</p>
                </div>
              ) : currentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F0F4FF]'}`}>
                    <svg className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-[#001AFF]/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold text-gray-800 mb-1">
                    {tab === 'my' ? '아직 워크플로우가 없습니다' : '공유받은 워크플로우가 없습니다'}
                  </p>
                  <p className="text-[13px] text-gray-400 mb-6">
                    {tab === 'my' ? '새 워크플로우를 만들어 학습 내용을 정리해보세요' : '다른 사용자가 공유한 워크플로우를 저장하면 여기에 나타납니다'}
                  </p>
                  {tab === 'my' && (
                    <button
                      onClick={handleCreate}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[#001AFF] hover:bg-[#0015D4] transition-all duration-200 shadow-lg shadow-[#001AFF]/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      첫 워크플로우 만들기
                    </button>
                  )}
                </div>
              ) : (
                <WorkflowList
                  workflows={currentList}
                  isDarkMode={isDarkMode}
                  isOwner={tab === 'my'}
                  onDelete={tab === 'my' ? handleDelete : undefined}
                  onRemoveSaved={tab === 'saved' ? handleRemoveSaved : undefined}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
