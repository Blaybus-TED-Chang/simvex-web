'use client';

import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ScrapInput } from '@/types/scrap';

interface ScrapButtonProps {
  user: User | null;
  isScraped: boolean;
  scrapInput: ScrapInput;
  onToggle: (input: ScrapInput) => Promise<void>;
  isDarkMode: boolean;
  size?: 'sm' | 'md';
}

export function ScrapButton({ user, isScraped, scrapInput, onToggle, isDarkMode, size = 'sm' }: ScrapButtonProps) {
  const router = useRouter();
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    onToggle(scrapInput);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1.5 rounded-lg transition-all ${
        isScraped
          ? 'text-red-500 hover:text-red-400'
          : isDarkMode
            ? 'text-gray-500 hover:text-red-400'
            : 'text-gray-400 hover:text-red-500'
      }`}
      title={isScraped ? '스크랩 해제' : '스크랩'}
    >
      {isScraped ? (
        <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
