'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface DownloadButtonProps {
  modelType: 'builtin' | 'user';
  glbUrl: string;
  fbxUrl?: string;
  modelName: string;
  isDarkMode: boolean;
  size?: 'sm' | 'md';
}

/** 파일 다운로드 (same-origin → <a download>, cross-origin → fetch+Blob) */
async function downloadFile(url: string, fileName: string) {
  const isSameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);

  if (isSameOrigin) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  }
}

export function DownloadButton({
  modelType,
  glbUrl,
  fbxUrl,
  modelName,
  isDarkMode,
  size = 'sm',
}: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasFbx = !!fbxUrl;
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleDownload = useCallback(
    async (format: 'glb' | 'fbx') => {
      if (format === 'fbx' && !fbxUrl) return;
      setDownloading(true);
      setOpen(false);
      try {
        const safeName = modelName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
        if (format === 'glb') {
          await downloadFile(glbUrl, `${safeName}.glb`);
        } else if (fbxUrl) {
          await downloadFile(fbxUrl, `${safeName}.fbx`);
        }
      } finally {
        setDownloading(false);
      }
    },
    [glbUrl, fbxUrl, modelName]
  );

  const disabledItem = isDarkMode
    ? 'text-gray-600 cursor-not-allowed'
    : 'text-gray-300 cursor-not-allowed';

  const enabledItem = isDarkMode
    ? 'hover:bg-gray-700 text-gray-200'
    : 'hover:bg-gray-50 text-gray-700';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={downloading}
        className={`p-1.5 rounded-lg transition-all ${
          isDarkMode
            ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
            : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
        } ${downloading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <DownloadIcon className={iconSize} />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-1 rounded-lg shadow-lg border z-50 min-w-[160px] py-1 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <button
            onClick={() => handleDownload('glb')}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${enabledItem}`}
          >
            GLB 다운로드
          </button>
          <button
            onClick={() => handleDownload('fbx')}
            disabled={!hasFbx}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${hasFbx ? enabledItem : disabledItem}`}
          >
            FBX 다운로드
          </button>
        </div>
      )}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
