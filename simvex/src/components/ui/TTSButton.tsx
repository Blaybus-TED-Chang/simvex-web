'use client';

import { useTTS } from '@/hooks/useTTS';

interface TTSButtonProps {
  text: string;
  isDarkMode?: boolean;
  size?: 'sm' | 'md';
}

export function TTSButton({ text, isDarkMode, size = 'sm' }: TTSButtonProps) {
  const { toggle, isSpeaking } = useTTS();

  const sizeClasses = size === 'sm' ? 'w-6 h-6 p-0.5' : 'w-8 h-8 p-1';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={() => toggle(text)}
      className={`inline-flex items-center justify-center rounded-md transition-colors shrink-0 ${sizeClasses} ${
        isSpeaking
          ? 'text-[#001AFF] bg-blue-50'
          : isDarkMode
          ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
      title={isSpeaking ? '음성 중지' : '음성으로 듣기'}
    >
      {isSpeaking ? (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </button>
  );
}
