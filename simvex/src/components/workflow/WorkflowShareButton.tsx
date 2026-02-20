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

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-lg border transition-all duration-200 ${
          isDarkMode
            ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        공유
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease both' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
            style={{ animation: 'scaleIn 0.25s ease both' }}
          >
            {/* 상단 장식 바 */}
            <div className="h-1 bg-gradient-to-r from-[#001AFF] via-[#4D6AFF] to-[#001AFF]" />

            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#001AFF] to-[#4D6AFF] flex items-center justify-center shadow-sm">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900">공유 링크</h3>
                  <p className="text-[12px] text-gray-400">이 링크를 받은 사람은 읽기 전용으로 접근할 수 있습니다</p>
                </div>
              </div>

              {/* 링크 복사 */}
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl ?? ''}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-700 outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 shrink-0 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-[#001AFF] text-white hover:bg-[#0015D4] shadow-sm shadow-[#001AFF]/20'
                  }`}
                >
                  {copied ? '복사 완료' : '복사'}
                </button>
              </div>

              {/* 닫기 */}
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full py-2.5 rounded-xl text-[13px] font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
