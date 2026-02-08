'use client';

import Link from 'next/link';

interface LoginRequiredProps {
  isDarkMode: boolean;
}

export function LoginRequired({ isDarkMode }: LoginRequiredProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center px-6">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <svg className={`w-7 h-7 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          로그인 후 노트를 작성할 수 있습니다
        </p>
        <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          노트는 클라우드에 자동 저장됩니다
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          로그인하기
        </Link>
      </div>
    </div>
  );
}
