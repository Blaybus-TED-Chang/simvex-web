'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useViewerStore } from '@/lib/store/viewerStore';
import { createClient } from '@/lib/supabase/client';
import type { Visibility } from '@/types/userModel';

/* ── 공개 상태 드롭다운 (models 페이지와 동일) ── */
type VisibilityState = 'private' | 'shared' | 'public';

const VISIBILITY_OPTIONS: { key: VisibilityState; label: string; desc: string }[] = [
  { key: 'public',  label: '전체공개', desc: 'World 게시, 누구나 열람·다운' },
  { key: 'shared',  label: '일부공개', desc: '링크가 있으면 열람·다운 가능' },
  { key: 'private', label: '비공개',   desc: '나만 볼 수 있음' },
];

function VisibilityIcon({ state }: { state: VisibilityState }) {
  if (state === 'public') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (state === 'shared') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function VisibilityDropdown({
  state,
  onChange,
}: {
  state: VisibilityState;
  onChange?: (next: VisibilityState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(state);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => { setLocal(state); }, [state]);

  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
    };
    updatePos();
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      const portal = document.getElementById('vis-dropdown-portal-mypage');
      if (portal?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  const bg = local === 'public' ? 'bg-green-500/80' : local === 'shared' ? 'bg-blue-500/80' : 'bg-gray-500/80';

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className={`w-8 h-8 rounded-full ${bg} backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer`}
        title={VISIBILITY_OPTIONS.find((o) => o.key === local)?.label}
      >
        <span className="text-white"><VisibilityIcon state={local} /></span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          id="vis-dropdown-portal-mypage"
          className="fixed flex gap-1.5 p-1.5 rounded-full bg-white shadow-xl border border-gray-200"
          style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9999 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {VISIBILITY_OPTIONS.map((opt) => {
            const active = local === opt.key;
            const optBg = opt.key === 'public' ? 'bg-green-500' : opt.key === 'shared' ? 'bg-blue-500' : 'bg-gray-500';
            return (
              <button
                key={opt.key}
                onClick={() => {
                  setLocal(opt.key);
                  onChange?.(opt.key);
                  setOpen(false);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                  active
                    ? `${optBg} text-white ring-2 ring-offset-1 ring-blue-300`
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={`${opt.label}: ${opt.desc}`}
              >
                <VisibilityIcon state={opt.key} />
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

/* ── 사이드바 탭 타입 ── */
type SidebarTab = 'account' | 'my-models';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { models: myModels, loading: modelsLoading, changeVisibility } = useUserModels(user);
  const [activeTab, setActiveTab] = useState<SidebarTab>('account');
  const [loggingOut, startLogout] = useTransition();

  // 닉네임 편집 상태
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 프로필 사진 업로드 상태
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

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

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';

  // 프로필 사진 업로드
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || uploadingAvatar) return;
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const path = `${user.id}/avatar.png`;
      const { error: uploadError } = await supabase.storage
        .from('user-models')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('user-models')
        .getPublicUrl(path);
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl + '?t=' + Date.now() },
      });
    } catch (err) {
      console.error('아바타 업로드 실패:', err);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // 닉네임 저장
  const handleSaveName = async () => {
    if (!newName.trim() || savingName) return;
    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { name: newName.trim() } });
    if (!error) {
      setEditingName(false);
    }
    setSavingName(false);
  };

  // 닉네임 편집 시작
  const startEditName = () => {
    setNewName(displayName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  // 로그아웃
  const handleLogout = () => {
    startLogout(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/models');
    });
  };

  // 가입일 포맷
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  // 로딩 중
  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SIDEBAR_TABS: { key: SidebarTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'account',
      label: '계정 설정',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'my-models',
      label: '나의 모델',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ══════ 상단 헤더 바 ══════ */}
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
          <div className="flex items-center gap-2.5 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="프로필" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold shadow-inner">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[14px] font-medium text-gray-700">{displayName}</span>
          </div>
        </div>
      </header>

      {/* ══════ 사이드바 + 메인 ══════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══════ 사이드바 ══════ */}
        <aside className="models-sidebar w-[240px] flex flex-col justify-between bg-[#F8FAFF] shrink-0 border-0" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
          <div>
            {/* 프로필 요약 */}
            <div className="px-5 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프로필" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[15px] font-bold shadow-inner shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <nav className="flex flex-col gap-1 px-4 pt-4">
              {SIDEBAR_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`models-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-[#001AFF] text-white models-nav-active'
                        : 'text-gray-800 hover:bg-[#001AFF] hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              {/* 구분선 */}
              <div className="my-2 border-t border-gray-200" />

              {/* 모델 둘러보기 */}
              <Link
                href="/models"
                className="models-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-[#001AFF] hover:text-white transition-all duration-200"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>모델 둘러보기</span>
              </Link>
            </nav>
          </div>

          {/* 하단 로그아웃 */}
          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{loggingOut ? '로그아웃 중...' : '로그아웃'}</span>
            </button>
          </div>
        </aside>

        {/* ══════ 메인 콘텐츠 ══════ */}
        <main className="flex-1 overflow-y-auto bg-white" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
          <div className="max-w-[960px] mx-auto px-8 py-8">

            {/* ── 계정 설정 탭 ── */}
            {activeTab === 'account' && (
              <div className="space-y-6" style={{ animation: 'fadeIn 0.3s ease both' }}>
                <h2 className="text-[22px] font-bold text-gray-900">계정 설정</h2>

                {/* 프로필 카드 */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="relative w-14 h-14 rounded-full shrink-0 group cursor-pointer overflow-hidden"
                      title="프로필 사진 변경"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="프로필" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[22px] font-bold shadow-inner">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <div className="flex-1 min-w-0">
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={nameInputRef}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                            className="text-[18px] font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 outline-none focus:border-[#001AFF] focus:ring-1 focus:ring-[#001AFF] transition-all w-[200px]"
                            maxLength={30}
                          />
                          <button
                            onClick={handleSaveName}
                            disabled={savingName || !newName.trim()}
                            className="px-3 py-1.5 bg-[#001AFF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0015CC] transition-colors disabled:opacity-50"
                          >
                            {savingName ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={() => setEditingName(false)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[13px] font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[18px] font-bold text-gray-900">{displayName}</span>
                          <button
                            onClick={startEditName}
                            className="p-1 rounded-md text-gray-400 hover:text-[#001AFF] hover:bg-blue-50 transition-colors"
                            title="닉네임 변경"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <p className="text-[14px] text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* 계정 정보 카드 */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-[16px] font-bold text-gray-900">계정 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] text-gray-400 mb-1">이메일</p>
                      <p className="text-[14px] font-medium text-gray-700">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-400 mb-1">가입일</p>
                      <p className="text-[14px] font-medium text-gray-700">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* 활동 통계 카드 */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#001AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[28px] font-bold text-gray-900">{myModels.length}<span className="text-[14px] font-medium text-gray-400 ml-1">개</span></p>
                      <p className="text-[13px] text-gray-500">내 모델</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 나의 모델 탭 ── */}
            {activeTab === 'my-models' && (
              <div style={{ animation: 'fadeIn 0.3s ease both' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[22px] font-bold text-gray-900">나의 모델</h2>
                  <Link
                    href="/upload"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#001AFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0015CC] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    모델 업로드
                  </Link>
                </div>

                {modelsLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : myModels.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-[15px] font-medium text-gray-500 mb-1">아직 업로드한 모델이 없습니다</p>
                    <p className="text-[13px] text-gray-400 mb-4">GLB 또는 FBX 파일을 업로드해보세요</p>
                    <Link
                      href="/upload"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#001AFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0015CC] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      모델 업로드하기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-5">
                    {myModels.map((model, i) => {
                      const thumbnailUrl = model.thumbnail_storage_path
                        ? getPublicUrl(model.thumbnail_storage_path)
                        : null;
                      const partsCount = (model.parts_config as unknown[]).length;
                      const vis = (model.visibility || (model.is_public ? 'public' : 'private')) as VisibilityState;

                      return (
                        <Link key={model.id} href={`/viewer/u-${model.id}`} className="group models-card" style={{ animationDelay: `${i * 60}ms` }}>
                          <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200">
                            <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                              {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                  </svg>
                                </div>
                              )}
                              {/* Visibility 드롭다운 */}
                              <div className="absolute bottom-2.5 right-2.5">
                                <VisibilityDropdown
                                  state={vis}
                                  onChange={(next) => changeVisibility(model.id, next as Visibility)}
                                />
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors mb-1">
                                {model.name}
                              </h3>
                              <p className="text-[13px] font-semibold text-[#001AFF] mb-1.5">
                                공학 &gt; {model.category} · {partsCount}개 부품
                              </p>
                              <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                                {model.description || '설명 없음'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


          </div>
        </main>
      </div>
    </div>
  );
}
