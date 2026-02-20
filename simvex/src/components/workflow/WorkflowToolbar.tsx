'use client';

import React from 'react';
import Link from 'next/link';
import { WorkflowShareButton } from './WorkflowShareButton';

interface WorkflowToolbarProps {
  title: string;
  isDarkMode: boolean;
  isOwner: boolean;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onAddNode: () => void;
  onGenerateShareLink: () => Promise<string | null>;
}

export function WorkflowToolbar({
  title,
  isDarkMode,
  isOwner,
  saving,
  onTitleChange,
  onSave,
  onAddNode,
  onGenerateShareLink,
}: WorkflowToolbarProps) {
  return (
    <div className={`flex items-center gap-3 px-5 shrink-0 border-b ${
      isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
    }`} style={{ height: 56 }}>
      {/* 뒤로가기 + 로고 */}
      <Link href="/workflow" className={`flex items-center gap-2.5 shrink-0 rounded-lg px-2 py-1.5 -ml-2 transition-colors ${
        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
      }`}>
        <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[18px] text-[#001AFF] shrink-0" style={{ fontFamily: 'Righteous', fontWeight: 400 }}>VEXA</span>
      </Link>

      {/* 구분선 */}
      <div className={`w-px h-5 shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

      {/* 제목 */}
      {isOwner ? (
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`text-[15px] font-semibold bg-transparent outline-none min-w-0 flex-1 px-2 py-1 rounded-lg transition-colors ${
            isDarkMode ? 'text-white focus:bg-gray-800' : 'text-gray-900 focus:bg-gray-50'
          }`}
          placeholder="워크플로우 제목"
        />
      ) : (
        <span className="text-[15px] font-semibold min-w-0 truncate flex-1">{title || '제목 없음'}</span>
      )}

      {/* 저장 상태 */}
      {isOwner && (
        <span className={`flex items-center gap-1.5 text-[12px] shrink-0 ${saving ? 'text-[#001AFF]' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {saving ? (
            <>
              <div className="w-3 h-3 border-2 border-[#001AFF] border-t-transparent rounded-full animate-spin" />
              저장 중
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              저장됨
            </>
          )}
        </span>
      )}

      {/* 액션 버튼 */}
      {isOwner && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-lg border transition-all duration-200 ${
              isDarkMode
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
            title="저장 (Ctrl+S / Cmd+S)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            저장
          </button>

          <button
            onClick={onAddNode}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-lg text-white bg-[#001AFF] hover:bg-[#0015D4] transition-all duration-200 shadow-sm shadow-[#001AFF]/20 active:scale-[0.97]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            노드 추가
          </button>

          <WorkflowShareButton isDarkMode={isDarkMode} onGenerateLink={onGenerateShareLink} />
        </div>
      )}
    </div>
  );
}
