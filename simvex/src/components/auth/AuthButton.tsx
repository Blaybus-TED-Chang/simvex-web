'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useViewerStore } from '@/lib/store/viewerStore';
import { ViewerState, ViewerActions } from '@/types/viewer';

export function AuthButton({ variant = 'default' }: { variant?: 'default' | 'viewer' }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const isDarkMode = useViewerStore((s: ViewerState & ViewerActions) => s.isDarkMode);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className={`h-9 w-20 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
    );
  }

  if (user) {
    const displayName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자';
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

    // viewer 모드: 프로필 사진 + 이름만, 로그아웃 없음
    if (variant === 'viewer') {
      return (
        <Link href="/mypage" className={`flex items-center gap-2 shrink-0 rounded-full px-2 py-1.5 transition-all duration-200 cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="프로필" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[12px] font-bold shadow-inner">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className={`text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{displayName}</span>
        </Link>
      );
    }

    // default 모드: 이메일 + 로그아웃
    return (
      <div className="flex items-center gap-3">
        <span className={`text-sm hidden sm:inline ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDarkMode
              ? 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/auth/login')}
      className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
    >
      로그인
    </button>
  );
}

