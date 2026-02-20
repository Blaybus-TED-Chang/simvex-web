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

const visibilityConfig = {
  private: { label: '비공개', color: 'bg-gray-100 text-gray-500', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  shared: { label: '공유됨', color: 'bg-blue-50 text-blue-600', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  public: { label: '전체공개', color: 'bg-green-50 text-green-600', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export function WorkflowCard({ workflow, isDarkMode, isOwner, onDelete, onRemoveSaved }: WorkflowCardProps) {
  const nodeCount = (workflow.nodes_data ?? []).length;
  const edgeCount = (workflow.edges_data ?? []).length;
  const date = new Date(workflow.updated_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  const vis = visibilityConfig[workflow.visibility] || visibilityConfig.private;

  return (
    <div className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
        : 'bg-white border-gray-200 hover:border-[#001AFF]/30'
    }`}>
      <Link href={`/workflow/${workflow.id}`} className="block">
        {/* 미니맵 프리뷰 영역 */}
        <div className={`relative h-[140px] overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-[#F0F4FF] to-[#E8ECFF]'}`}>
          {/* 노드 미니 시각화 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {nodeCount === 0 ? (
              <div className="text-center">
                <svg className={`w-10 h-10 mx-auto mb-1 ${isDarkMode ? 'text-gray-700' : 'text-[#001AFF]/15'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <p className={`text-[11px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>빈 워크플로우</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* 간단한 노드 표현 (최대 5개) */}
                {(workflow.nodes_data ?? []).slice(0, 5).map((node, i) => (
                  <div
                    key={node.id}
                    className={`rounded-lg px-2 py-1.5 text-[10px] font-medium truncate max-w-[70px] shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                    }`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {node.title || `노드 ${i + 1}`}
                  </div>
                ))}
                {nodeCount > 5 && (
                  <span className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>+{nodeCount - 5}</span>
                )}
              </div>
            )}
          </div>

          {/* 공개 상태 뱃지 */}
          <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${vis.color}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={vis.icon} />
            </svg>
            {vis.label}
          </div>
        </div>

        {/* 카드 본문 */}
        <div className="p-4">
          <h3 className={`text-[15px] font-bold truncate mb-1 transition-colors ${
            isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-[#001AFF]'
          }`}>
            {workflow.title || '제목 없음'}
          </h3>
          <p className={`text-[12px] line-clamp-2 mb-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {workflow.description || '설명을 추가하세요'}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-[12px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
              <span>노드 {nodeCount}</span>
            </div>
            <div className={`flex items-center gap-1 text-[12px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              </svg>
              <span>연결 {edgeCount}</span>
            </div>
            <span className={`text-[11px] ml-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{date}</span>
          </div>
        </div>
      </Link>

      {/* 액션 버튼 */}
      {(isOwner && onDelete) || (!isOwner && onRemoveSaved) ? (
        <div className={`px-4 pb-3 pt-0 flex justify-end`}>
          {isOwner && onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(workflow.id); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
            </button>
          )}
          {!isOwner && onRemoveSaved && (
            <button
              onClick={(e) => { e.preventDefault(); onRemoveSaved(workflow.id); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              저장 해제
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
