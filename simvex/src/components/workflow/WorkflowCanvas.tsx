'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { WorkflowNode, WorkflowEdge as WEdge, WorkflowNodeLink, WorkflowAttachmentRow } from '@/types/workflow';
import { WorkflowNodeComponent } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { WorkflowNodeEditor } from './WorkflowNodeEditor';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WEdge[];
  isOwner: boolean;
  isDarkMode: boolean;
  canvasOffset: number[];
  canvasZoom: number;
  attachments: WorkflowAttachmentRow[];
  uploading: boolean;
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WEdge[]) => void;
  onCanvasOffsetChange: (offset: number[]) => void;
  onCanvasZoomChange: (zoom: number) => void;
  onUploadFile: (nodeId: string, file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  getDownloadUrl: (storagePath: string) => string;
}

export function WorkflowCanvas({
  nodes,
  edges,
  isOwner,
  isDarkMode,
  canvasOffset,
  canvasZoom,
  attachments,
  uploading,
  onNodesChange,
  onEdgesChange,
  onCanvasOffsetChange,
  onCanvasZoomChange,
  onUploadFile,
  onDeleteAttachment,
  getDownloadUrl,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorNodeId, setEditorNodeId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ nodeId: string; startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number; offsetStart: number[] } | null>(null);
  const [connecting, setConnecting] = useState<{ sourceId: string; side: 'left' | 'right'; canvasX: number; canvasY: number } | null>(null);

  // 노드 선택
  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setEditorNodeId(id);
  }, []);

  // 노드 드래그 시작
  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !isOwner) return;
    setDragging({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    });
  }, [nodes, isOwner]);

  // 노드 제목/내용 변경
  const handleTitleChange = useCallback((id: string, title: string) => {
    onNodesChange(nodes.map((n) => (n.id === id ? { ...n, title } : n)));
  }, [nodes, onNodesChange]);

  const handleContentChange = useCallback((id: string, content: string) => {
    onNodesChange(nodes.map((n) => (n.id === id ? { ...n, content } : n)));
  }, [nodes, onNodesChange]);

  // 노드 삭제
  const handleDeleteNode = useCallback((id: string) => {
    onNodesChange(nodes.filter((n) => n.id !== id));
    onEdgesChange(edges.filter((e) => e.sourceNodeId !== id && e.targetNodeId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    if (editorNodeId === id) setEditorNodeId(null);
  }, [nodes, edges, selectedNodeId, editorNodeId, onNodesChange, onEdgesChange]);

  // 엣지 삭제
  const handleDeleteEdge = useCallback((id: string) => {
    onEdgesChange(edges.filter((e) => e.id !== id));
  }, [edges, onEdgesChange]);

  // 커넥터 드래그 시작
  const handleConnectStart = useCallback((nodeId: string, side: 'left' | 'right', e: React.MouseEvent) => {
    if (!isOwner) return;
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = (e.clientX - rect.left - canvasOffset[0]) / canvasZoom;
    const cy = (e.clientY - rect.top - canvasOffset[1]) / canvasZoom;
    setConnecting({ sourceId: nodeId, side, canvasX: cx, canvasY: cy });
  }, [isOwner, canvasOffset, canvasZoom]);

  // 에디터에서 링크 변경
  const handleLinksChange = useCallback((links: WorkflowNodeLink[]) => {
    if (!editorNodeId) return;
    onNodesChange(nodes.map((n) => (n.id === editorNodeId ? { ...n, links } : n)));
  }, [editorNodeId, nodes, onNodesChange]);

  // 마우스 이벤트: 드래그, 팬, 커넥트
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const dx = (e.clientX - dragging.startX) / canvasZoom;
        const dy = (e.clientY - dragging.startY) / canvasZoom;
        onNodesChange(nodes.map((n) =>
          n.id === dragging.nodeId
            ? { ...n, x: dragging.nodeStartX + dx, y: dragging.nodeStartY + dy }
            : n,
        ));
      } else if (panning) {
        const dx = e.clientX - panning.startX;
        const dy = e.clientY - panning.startY;
        onCanvasOffsetChange([panning.offsetStart[0] + dx, panning.offsetStart[1] + dy]);
      } else if (connecting) {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const cx = (e.clientX - rect.left - canvasOffset[0]) / canvasZoom;
          const cy = (e.clientY - rect.top - canvasOffset[1]) / canvasZoom;
          setConnecting((prev) => prev ? { ...prev, canvasX: cx, canvasY: cy } : null);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (connecting) {
        // 마우스 위치에서 노드 찾기
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const cx = (e.clientX - rect.left - canvasOffset[0]) / canvasZoom;
          const cy = (e.clientY - rect.top - canvasOffset[1]) / canvasZoom;
          const targetNode = nodes.find((n) =>
            cx >= n.x && cx <= n.x + n.width && cy >= n.y && cy <= n.y + 140,
          );
          if (targetNode && targetNode.id !== connecting.sourceId) {
            // 중복 엣지 방지
            const exists = edges.some(
              (e) =>
                (e.sourceNodeId === connecting.sourceId && e.targetNodeId === targetNode.id) ||
                (e.sourceNodeId === targetNode.id && e.targetNodeId === connecting.sourceId),
            );
            if (!exists) {
              const sourceId = connecting.side === 'right' ? connecting.sourceId : targetNode.id;
              const tgtId = connecting.side === 'right' ? targetNode.id : connecting.sourceId;
              onEdgesChange([...edges, { id: crypto.randomUUID(), sourceNodeId: sourceId, targetNodeId: tgtId }]);
            }
          }
        }
        setConnecting(null);
      }
      setDragging(null);
      setPanning(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, panning, connecting, nodes, edges, canvasOffset, canvasZoom, onNodesChange, onCanvasOffsetChange, onEdgesChange]);

  // 캔버스 빈 영역 클릭 시 팬 시작
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas === 'true') {
      setPanning({ startX: e.clientX, startY: e.clientY, offsetStart: [...canvasOffset] });
      setSelectedNodeId(null);
    }
  }, [canvasOffset]);

  // 줌
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.max(0.3, Math.min(2.0, canvasZoom + delta));
    onCanvasZoomChange(newZoom);
  }, [canvasZoom, onCanvasZoomChange]);

  const bg = isDarkMode ? 'bg-gray-950' : 'bg-gray-100';
  const editorNode = editorNodeId ? nodes.find((n) => n.id === editorNodeId) : null;

  // 임시 연결선 (드래그 중) - connecting state에 캔버스 좌표가 이미 계산됨
  const connectingLine = (() => {
    if (!connecting) return null;
    const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
    if (!sourceNode) return null;

    const sx = connecting.side === 'right'
      ? sourceNode.x + sourceNode.width
      : sourceNode.x;
    const sy = sourceNode.y + 60;

    return (
      <line x1={sx} y1={sy} x2={connecting.canvasX} y2={connecting.canvasY} stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" />
    );
  })();

  return (
    <div className={`flex-1 relative overflow-hidden ${bg}`} ref={containerRef}>
      {/* 캔버스 영역 */}
      <div
        data-canvas="true"
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{
          backgroundImage: isDarkMode
            ? 'radial-gradient(circle, #374151 1px, transparent 1px)'
            : 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: `${20 * canvasZoom}px ${20 * canvasZoom}px`,
          backgroundPosition: `${canvasOffset[0]}px ${canvasOffset[1]}px`,
        }}
      >
        {/* 변환 컨테이너 */}
        <div
          style={{
            transform: `translate(${canvasOffset[0]}px, ${canvasOffset[1]}px) scale(${canvasZoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG 엣지 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={isDarkMode ? '#9ca3af' : '#6b7280'} />
              </marker>
            </defs>
            <g className="pointer-events-auto">
              {edges.map((edge) => {
                const sn = nodes.find((n) => n.id === edge.sourceNodeId);
                const tn = nodes.find((n) => n.id === edge.targetNodeId);
                if (!sn || !tn) return null;
                return (
                  <WorkflowEdge
                    key={edge.id}
                    id={edge.id}
                    sourceNode={sn}
                    targetNode={tn}
                    isOwner={isOwner}
                    onDelete={handleDeleteEdge}
                  />
                );
              })}
              {connectingLine}
            </g>
          </svg>

          {/* 노드 */}
          {nodes.map((node) => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              isOwner={isOwner}
              isSelected={selectedNodeId === node.id}
              isDarkMode={isDarkMode}
              attachmentCount={attachments.filter((a) => a.node_id === node.id).length}

              onSelect={handleSelectNode}
              onDragStart={handleNodeDragStart}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
              onDelete={handleDeleteNode}
              onConnectStart={handleConnectStart}
            />
          ))}
        </div>
      </div>

      {/* 줌 표시 */}
      <div className={`absolute bottom-4 left-4 text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
        {Math.round(canvasZoom * 100)}%
      </div>

      {/* 노드 에디터 사이드패널 */}
      {editorNode && (
        <WorkflowNodeEditor
          node={editorNode}
          isOwner={isOwner}
          isDarkMode={isDarkMode}
          attachments={attachments.filter((a) => a.node_id === editorNode.id)}
          uploading={uploading}
          onClose={() => setEditorNodeId(null)}
          onTitleChange={(title) => handleTitleChange(editorNode.id, title)}
          onContentChange={(content) => handleContentChange(editorNode.id, content)}
          onLinksChange={handleLinksChange}
          onUploadFile={(file) => onUploadFile(editorNode.id, file)}
          onDeleteAttachment={onDeleteAttachment}
          getDownloadUrl={getDownloadUrl}
        />
      )}
    </div>
  );
}
