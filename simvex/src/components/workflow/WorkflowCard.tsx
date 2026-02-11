'use client';

import React from 'react';
import Link from 'next/link';
import type { WorkflowRow } from '@/types/workflow';

interface WorkflowCardProps {
  workflow: WorkflowRow;
  isDarkMode: boolean;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  onRemoveSaved?: (id: string) => void;
}

export function WorkflowCard({ workflow, isDarkMode, isOwner, onDelete, onRemoveSaved }: WorkflowCardProps) {
  const nodeCount = (workflow.nodes_data ?? []).length;
  const edgeCount = (workflow.edges_data ?? []).length;
  const date = new Date(workflow.updated_at).toLocaleDateString('ko-KR');

  const bg = isDarkMode
    ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
    : 'bg-white border-gray-200 hover:border-gray-400';

  return (
    <div className={`rounded-lg border p-4 transition-colors ${bg}`}>
      <Link href={`/workflow/${workflow.id}`}>
        <h3 className={`text-sm font-semibold truncate mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {workflow.title || '제목 없음'}
        </h3>
        <p className={`text-xs line-clamp-2 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {workflow.description || '설명 없음'}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>노드 {nodeCount}</span>
          <span>연결 {edgeCount}</span>
          <span>{date}</span>
          {workflow.visibility === 'shared' && <span className="text-blue-400">공유됨</span>}
        </div>
      </Link>
      <div className="flex justify-end mt-2 gap-2">
        {isOwner && onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); onDelete(workflow.id); }}
            className="text-xs text-red-400 hover:text-red-600"
          >
            삭제
          </button>
        )}
        {!isOwner && onRemoveSaved && (
          <button
            onClick={(e) => { e.preventDefault(); onRemoveSaved(workflow.id); }}
            className="text-xs text-gray-400 hover:text-red-400"
          >
            저장 해제
          </button>
        )}
      </div>
    </div>
  );
}
