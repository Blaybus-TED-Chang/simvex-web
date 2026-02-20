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
  top:    '-top-2.5 left-1/2 -translate-x-1/2',
  bottom: '-bottom-2.5 left-1/2 -translate-x-1/2',
  left:   'top-1/2 -left-2.5 -translate-y-1/2',
  right:  'top-1/2 -right-2.5 -translate-y-1/2',
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

  const isConnecting = connectingFromNodeId !== null;
  const isSource = connectingFromNodeId === node.id;

  return (
    <div
      ref={nodeRef}
      className={`absolute group select-none rounded-2xl overflow-hidden transition-shadow duration-200 ${
        isSelected
          ? isDarkMode
            ? 'ring-2 ring-[#4D6AFF] shadow-lg shadow-[#001AFF]/20'
            : 'ring-2 ring-[#001AFF] shadow-lg shadow-[#001AFF]/15'
          : isDarkMode
            ? 'shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40'
            : 'shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-gray-300/80'
      } ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: NODE_HEIGHT_MIN,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      onMouseDown={handleMouseDown}
    >
      {/* 상단 컬러 액센트 바 */}
      <div className="h-1 bg-gradient-to-r from-[#001AFF] via-[#4D6AFF] to-[#001AFF]" />

      {/* 4방향 커넥터 */}
      {isOwner && (['top', 'bottom', 'left', 'right'] as ConnectorSide[]).map((side) => (
        <div
          key={side}
          data-connector="true"
          className={`absolute ${connectorPos[side]} w-5 h-5 rounded-full border-2 cursor-pointer z-20 transition-all duration-200 ${
            isSource
              ? 'opacity-50 bg-gray-400 border-gray-300'
              : isConnecting
                ? 'opacity-100 bg-green-500 border-white scale-110 animate-pulse shadow-md shadow-green-500/30'
                : 'opacity-0 group-hover:opacity-100 bg-[#001AFF] border-white hover:scale-110 shadow-md shadow-[#001AFF]/30'
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
      <div className={`flex items-center justify-between px-3.5 py-2.5 cursor-move ${
        isDarkMode ? 'border-b border-gray-700/60' : 'border-b border-gray-100'
      }`}>
        {isOwner ? (
          <input
            value={node.title}
            onChange={(e) => onTitleChange(node.id, e.target.value)}
            className={`text-[13px] font-bold bg-transparent outline-none flex-1 min-w-0 ${
              isDarkMode ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-300'
            }`}
            placeholder="제목을 입력하세요"
          />
        ) : (
          <span className={`text-[13px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {node.title || '제목 없음'}
          </span>
        )}
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className={`ml-1.5 w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 ${
              isDarkMode
                ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/30'
                : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 내용 */}
      <div className="px-3.5 py-2.5">
        {isOwner ? (
          <textarea
            value={node.content}
            onChange={(e) => onContentChange(node.id, e.target.value)}
            className={`w-full text-[12px] leading-relaxed bg-transparent outline-none resize-none min-h-[48px] ${
              isDarkMode ? 'text-gray-300 placeholder:text-gray-600' : 'text-gray-600 placeholder:text-gray-300'
            }`}
            placeholder="내용을 입력하세요..."
            rows={3}
          />
        ) : (
          <p className={`text-[12px] leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {node.content || '(내용 없음)'}
          </p>
        )}
      </div>

      {/* 하단 뱃지 */}
      {(attachmentCount > 0 || node.links.length > 0) && (
        <div className={`px-3.5 pb-2.5 flex items-center gap-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {attachmentCount > 0 && (
            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {attachmentCount}
            </span>
          )}
          {node.links.length > 0 && (
            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {node.links.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
