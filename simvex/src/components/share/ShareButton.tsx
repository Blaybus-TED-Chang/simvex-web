'use client';

import { useState, useCallback } from 'react';

interface ShareButtonProps {
  modelId: string;
  isDarkMode: boolean;
  size?: 'sm' | 'md';
}

export function ShareButton({ modelId, isDarkMode, size = 'sm' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/viewer/${modelId}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 폴백: textarea를 이용한 복사
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [modelId]);

  return (
    <button
      onClick={handleClick}
      className={`p-1.5 rounded-lg transition-all ${
        copied
          ? 'text-green-500'
          : isDarkMode
            ? 'text-gray-500 hover:text-blue-400'
            : 'text-gray-400 hover:text-blue-500'
      }`}
      title={copied ? '링크 복사됨!' : '공유 링크 복사'}
    >
      {copied ? (
        <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  );
}
