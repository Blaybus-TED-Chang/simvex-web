'use client';

import React, { useRef, useCallback } from 'react';
import type { WorkflowNode as WNode, ConnectorSide } from '@/types/workflow';

interface WorkflowNodeProps {
  node: WNode;
  isOwner: boolean;
  isSelected: boolean;
  isDarkMode: boolean;
  attachmentCount: number;
  /** 현재 연결 대기 중인 소스 노드 ID (활성화 표시용) */
  connectingFromNodeId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onTitleChange: (id: string, title: string) => void;
  onContentChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onConnectorClick: (nodeId: string, side: ConnectorSide) => void;
}

const NODE_HEIGHT_MIN = 120;

/** 커넥터 위치 스타일 */
const connectorPos: Record<ConnectorSide, string> = {
  top:    '-top-3 left-1/2 -translate-x-1/2',
  bottom: '-bottom-3 left-1/2 -translate-x-1/2',
  left:   'top-1/2 -left-3 -translate-y-1/2',
  right:  'top-1/2 -right-3 -translate-y-1/2',
};

export function WorkflowNodeComponent({
  node,
  isOwner,
  isSelected,
  isDarkMode,
  attachmentCount,
  connectingFromNodeId,
  onSelect,
  onDragStart,
  onTitleChange,
  onContentChange,
  onDelete,
  onConnectorClick,
}: WorkflowNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
    // data-connector 클릭은 별도 처리
    if ((e.target as HTMLElement).dataset.connector === 'true') return;
    e.stopPropagation();
    onDragStart(node.id, e);
  }, [node.id, onDragStart]);

  const bgColor = isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300';
  const selectedBorder = isSelected ? 'ring-2 ring-blue-500' : '';
  const isConnecting = connectingFromNodeId !== null;
  const isSource = connectingFromNodeId === node.id;

  return (
    <div
      ref={nodeRef}
      className={`absolute rounded-lg border shadow-md group ${bgColor} ${selectedBorder} select-none`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: NODE_HEIGHT_MIN,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      onMouseDown={handleMouseDown}
    >
      {/* 4방향 커넥터 */}
      {isOwner && (['top', 'bottom', 'left', 'right'] as ConnectorSide[]).map((side) => (
        <div
          key={side}
          data-connector="true"
          className={`absolute ${connectorPos[side]} w-6 h-6 rounded-full border-2 cursor-pointer z-20 transition-all ${
            isSource
              ? 'opacity-50 bg-gray-400 border-gray-300'
              : isConnecting
                ? 'opacity-100 bg-green-500 border-white scale-125 animate-pulse'
                : 'opacity-0 group-hover:opacity-100 bg-blue-500 border-white hover:scale-125'
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onConnectorClick(node.id, side);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      ))}

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
