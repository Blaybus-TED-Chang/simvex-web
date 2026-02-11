'use client';

import React, { useState } from 'react';

interface WorkflowShareButtonProps {
  isDarkMode: boolean;
  onGenerateLink: () => Promise<string | null>;
}

export function WorkflowShareButton({ isDarkMode, onGenerateLink }: WorkflowShareButtonProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleShare = async () => {
    const token = await onGenerateLink();
    if (token) {
      const url = `${window.location.origin}/workflow/s/${token}`;
      setShareUrl(url);
      setShowModal(true);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bg = isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const inputBg = isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900';

  return (
    <>
      <button
        onClick={handleShare}
        className={`px-3 py-1.5 text-xs rounded border shrink-0 ${isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
      >
        공유
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-lg border p-6 w-96 shadow-xl ${bg}`}>
            <h3 className="text-sm font-semibold mb-3">공유 링크</h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl ?? ''}
                className={`flex-1 text-xs px-3 py-2 rounded border outline-none ${inputBg}`}
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 shrink-0"
              >
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">이 링크를 받은 사람은 읽기 전용으로 접근할 수 있습니다.</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full text-xs py-2 rounded border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
