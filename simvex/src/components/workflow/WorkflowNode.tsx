'use client';

import React, { useRef, useCallback } from 'react';
import type { WorkflowNode as WNode } from '@/types/workflow';

interface WorkflowNodeProps {
  node: WNode;
  isOwner: boolean;
  isSelected: boolean;
  isDarkMode: boolean;
  attachmentCount: number;
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onTitleChange: (id: string, title: string) => void;
  onContentChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onConnectStart: (nodeId: string, side: 'left' | 'right', e: React.MouseEvent) => void;
}

const NODE_HEIGHT_MIN = 120;

export function WorkflowNodeComponent({
  node,
  isOwner,
  isSelected,
  isDarkMode,
  attachmentCount,
  onSelect,
  onDragStart,
  onTitleChange,
  onContentChange,
  onDelete,
  onConnectStart,
}: WorkflowNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 텍스트 입력 영역이면 드래그 무시
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
    e.stopPropagation();
    onDragStart(node.id, e);
  }, [node.id, onDragStart]);

  const bgColor = isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300';
  const selectedBorder = isSelected ? 'ring-2 ring-blue-500' : '';

  return (
    <div
      ref={nodeRef}
      className={`absolute rounded-lg border shadow-md ${bgColor} ${selectedBorder} select-none`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: NODE_HEIGHT_MIN,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      onMouseDown={handleMouseDown}
    >
      {/* 왼쪽 커넥터 */}
      <div
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 cursor-crosshair z-10 transition-opacity"
        onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, 'left', e); }}
      />
      {/* 오른쪽 커넥터 */}
      <div
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 cursor-crosshair z-10 transition-opacity"
        onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, 'right', e); }}
      />

      {/* 헤더 */}
      <div className={`flex items-center justify-between px-3 py-2 border-b cursor-move ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        {isOwner ? (
          <input
            value={node.title}
            onChange={(e) => onTitleChange(node.id, e.target.value)}
            className={`text-sm font-semibold bg-transparent outline-none flex-1 min-w-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            placeholder="제목"
          />
        ) : (
          <span className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {node.title || '제목 없음'}
          </span>
        )}
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="ml-1 text-gray-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity"
          >
            X
          </button>
        )}
      </div>

      {/* 내용 */}
      <div className="px-3 py-2">
        {isOwner ? (
          <textarea
            value={node.content}
            onChange={(e) => onContentChange(node.id, e.target.value)}
            className={`w-full text-xs bg-transparent outline-none resize-none min-h-[48px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            placeholder="내용을 입력하세요..."
            rows={3}
          />
        ) : (
          <p className={`text-xs whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {node.content || '(내용 없음)'}
          </p>
        )}
      </div>

      {/* 하단 뱃지 */}
      <div className="px-3 pb-2 flex items-center gap-2 text-xs text-gray-400">
        {attachmentCount > 0 && <span>📎 {attachmentCount}</span>}
        {node.links.length > 0 && <span>🔗 {node.links.length}</span>}
      </div>
    </div>
  );
}
