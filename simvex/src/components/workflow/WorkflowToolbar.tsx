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
  onAddNode: () => void;
  onGenerateShareLink: () => Promise<string | null>;
}

export function WorkflowToolbar({
  title,
  isDarkMode,
  isOwner,
  saving,
  onTitleChange,
  onAddNode,
  onGenerateShareLink,
}: WorkflowToolbarProps) {
  const bg = isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className={`flex items-center gap-3 px-4 py-2 border-b ${bg}`}>
      <Link href="/workflow" className="text-gray-400 hover:text-gray-600 text-lg shrink-0">
        &larr;
      </Link>

      {isOwner ? (
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`text-base font-semibold bg-transparent outline-none flex-1 min-w-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          placeholder="워크플로우 제목"
        />
      ) : (
        <span className="text-base font-semibold flex-1 min-w-0 truncate">{title}</span>
      )}

      {/* 저장 상태 */}
      {isOwner && (
        <span className="text-xs text-gray-400 shrink-0">
          {saving ? '저장 중...' : '저장됨'}
        </span>
      )}

      {isOwner && (
        <>
          <button
            onClick={onAddNode}
            className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 shrink-0"
          >
            + 노드
          </button>
          <WorkflowShareButton isDarkMode={isDarkMode} onGenerateLink={onGenerateShareLink} />
        </>
      )}
    </div>
  );
}
