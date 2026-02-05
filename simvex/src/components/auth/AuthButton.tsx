'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function AuthButton() {
  const { user, loading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="h-9 w-20 bg-gray-700 rounded-lg animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 hidden sm:inline">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
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
