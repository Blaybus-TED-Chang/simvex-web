'use client';

import { useState } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';

type TabType = 'notes' | 'ai';

export function NotesPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const { notes, setNotes } = useViewerStore();

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'notes'
              ? 'text-white bg-gray-700/50'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            노트
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'ai'
              ? 'text-white bg-gray-700/50'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            AI 어시스턴트
          </span>
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === 'notes' ? (
          <div className="h-full flex flex-col">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="학습 내용을 메모하세요..."
              className="flex-1 w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3
                       text-sm text-gray-300 placeholder-gray-500 resize-none
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="mt-2 text-xs text-gray-500 text-right">
              자동 저장됨
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* AI 채팅 영역 (향후 구현) */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">AI 어시스턴트</p>
                <p className="text-xs text-gray-500 mt-1">준비 중입니다</p>
              </div>
            </div>

            {/* 입력창 */}
            <div className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="질문을 입력하세요..."
                  disabled
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-gray-300 placeholder-gray-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  disabled
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
