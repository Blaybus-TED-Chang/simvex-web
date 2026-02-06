'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useViewerStore } from '@/lib/store/viewerStore';
import { ViewerState, ViewerActions } from '@/types/viewer';

export function AuthButton() {
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
