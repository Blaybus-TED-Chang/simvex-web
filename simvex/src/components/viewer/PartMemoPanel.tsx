'use client';

import { useState } from 'react';
import { PartMemo } from '@/hooks/usePartMemos';

interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  color?: string;
}

interface PartMemoPanelProps {
  isDarkMode: boolean;
  isLoggedIn: boolean;
  selectedPart: PartInfo | null;
  memos: PartMemo[];
  loading: boolean;
  onCreateMemo: (partId: string, content: string, screenshotBlob: Blob) => Promise<void>;
  onDeleteMemo: (id: string, screenshotPath: string) => Promise<void>;
  onCaptureScreenshot: () => Promise<Blob | null>;
  onClose: () => void;
}

export function PartMemoPanel({
  isDarkMode,
  isLoggedIn,
  selectedPart,
  memos,
  loading,
  onCreateMemo,
  onDeleteMemo,
  onCaptureScreenshot,
  onClose,
}: PartMemoPanelProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(null);

  // 현재 선택된 부품의 메모만 필터
  const filteredMemos = selectedPart
    ? memos.filter((m) => m.partId === selectedPart.id)
    : memos;

  const handleSave = async () => {
    if (!selectedPart || !content.trim()) return;

    setSaving(true);
    try {
      const blob = await onCaptureScreenshot();
      if (blob) {
        await onCreateMemo(selectedPart.id, content.trim(), blob);
        setContent('');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memo: PartMemo) => {
    if (!confirm('이 메모를 삭제하시겠습니까?')) return;
    await onDeleteMemo(memo.id, memo.screenshotPath);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>부품 메모</h2>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 미로그인 안내 */}
        {!isLoggedIn && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm">로그인하면 부품 메모를 저장할 수 있습니다</p>
          </div>
        )}

        {/* 메모 작성 영역 */}
        {isLoggedIn && (
          <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50 border border-gray-200'}`}>
            {selectedPart ? (
              <>
                {/* 선택된 부품 표시 */}
                <div className="flex items-center gap-2 mb-2">
                  {selectedPart.color && (
                    <div
                      className={`w-3 h-3 rounded-full border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                      style={{ backgroundColor: selectedPart.color }}
                    />
                  )}
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedPart.nameKo}
                  </span>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="부품에 대한 메모를 입력하세요..."
                  rows={3}
                  className={`w-full text-sm rounded-lg p-2 resize-none outline-none ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 placeholder-gray-500 border border-gray-600 focus:border-teal-500'
                      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-teal-500'
                  }`}
                />

                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    저장 시 현재 화면이 자동 캡처됩니다
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={!content.trim() || saving}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                      !content.trim() || saving
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-500'
                    }`}
                  >
                    {saving ? '저장 중...' : '메모 저장'}
                  </button>
                </div>
              </>
            ) : (
              <div className={`text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <p className="text-sm">부품을 선택하면 메모를 작성할 수 있습니다</p>
              </div>
            )}
          </div>
        )}

        {/* 메모 목록 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className={`text-center py-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            <p className="text-sm">
              {selectedPart ? '이 부품에 대한 메모가 없습니다' : '저장된 메모가 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMemos.map((memo) => (
              <div
                key={memo.id}
                className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800/40' : 'bg-white border border-gray-200'}`}
              >
                {/* 스크린샷 썸네일 */}
                <button
                  onClick={() => setExpandedScreenshot(memo.screenshotUrl)}
                  className="w-full block"
                >
                  <img
                    src={memo.screenshotUrl}
                    alt="스크린샷"
                    className="w-full h-28 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </button>

                <div className="p-3">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {memo.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatDate(memo.createdAt)}
                    </span>
                    {isLoggedIn && (
                      <button
                        onClick={() => handleDelete(memo)}
                        className={`text-xs transition-colors ${
                          isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 스크린샷 확대 모달 */}
      {expandedScreenshot && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setExpandedScreenshot(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={expandedScreenshot}
              alt="스크린샷 확대"
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
            />
            <button
              onClick={() => setExpandedScreenshot(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
