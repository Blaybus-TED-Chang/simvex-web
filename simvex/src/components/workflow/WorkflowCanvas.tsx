'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { WorkflowNode, WorkflowEdge as WEdge, WorkflowNodeLink, WorkflowAttachmentRow, ConnectorSide } from '@/types/workflow';
import { WorkflowNodeComponent } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { WorkflowNodeEditor } from './WorkflowNodeEditor';
import { WorkflowMinimap } from './WorkflowMinimap';

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

const NODE_H = 120;

/** 커넥터 앵커 좌표 */
function getAnchor(node: WorkflowNode, side: ConnectorSide): [number, number] {
  switch (side) {
    case 'left':   return [node.x, node.y + NODE_H / 2];
    case 'right':  return [node.x + node.width, node.y + NODE_H / 2];
    case 'top':    return [node.x + node.width / 2, node.y];
    case 'bottom': return [node.x + node.width / 2, node.y + NODE_H];
  }
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
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorNodeId, setEditorNodeId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ nodeId: string; startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number; offsetStart: number[] } | null>(null);

  // 클릭 기반 연결 상태
  const [connectSource, setConnectSource] = useState<{ nodeId: string; side: ConnectorSide } | null>(null);
  // 마우스 추적 (캔버스 좌표)
  const [mouseCanvas, setMouseCanvas] = useState<{ x: number; y: number } | null>(null);

  // 노드 선택
  const handleSelectNode = useCallback((id: string) => {
    // 연결 모드 중 클릭 → 취소
    if (connectSource) {
      setConnectSource(null);
      setMouseCanvas(null);
      return;
    }
    setSelectedNodeId(id);
    setEditorNodeId(id);
  }, [connectSource]);

  // 노드 드래그 시작
  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    // 연결 모드 중 노드 본문 클릭 → 취소
    if (connectSource) {
      setConnectSource(null);
      setMouseCanvas(null);
      return;
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !isOwner) return;
    setDragging({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    });
  }, [nodes, isOwner, connectSource]);

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

  // 커넥터 클릭 핸들러 (onMouseDown으로 호출됨)
  const handleConnectorClick = useCallback((nodeId: string, side: ConnectorSide) => {
    if (!connectSource) {
      // 첫 번째 클릭: 소스 설정 + 즉시 선 표시를 위한 초기 위치
      const sourceNode = nodes.find((n) => n.id === nodeId);
      if (sourceNode) {
        const [ax, ay] = getAnchor(sourceNode, side);
        setMouseCanvas({ x: ax, y: ay });
      }
      setConnectSource({ nodeId, side });
    } else {
      // 두 번째 클릭: 같은 노드면 취소
      if (connectSource.nodeId === nodeId) {
        setConnectSource(null);
        setMouseCanvas(null);
        return;
      }
      // 중복 엣지 방지
      const exists = edges.some(
        (e) =>
          (e.sourceNodeId === connectSource.nodeId && e.targetNodeId === nodeId) ||
          (e.sourceNodeId === nodeId && e.targetNodeId === connectSource.nodeId),
      );
      if (!exists) {
        onEdgesChange([...edges, {
          id: crypto.randomUUID(),
          sourceNodeId: connectSource.nodeId,
          sourceSide: connectSource.side,
          targetNodeId: nodeId,
          targetSide: side,
        }]);
      }
      setConnectSource(null);
      setMouseCanvas(null);
    }
  }, [connectSource, edges, onEdgesChange, nodes]);

  // 에디터에서 링크 변경
  const handleLinksChange = useCallback((links: WorkflowNodeLink[]) => {
    if (!editorNodeId) return;
    onNodesChange(nodes.map((n) => (n.id === editorNodeId ? { ...n, links } : n)));
  }, [editorNodeId, nodes, onNodesChange]);

  // 에디터에서 색상 변경
  const handleColorChange = useCallback((color: string | undefined) => {
    if (!editorNodeId) return;
    onNodesChange(nodes.map((n) => (n.id === editorNodeId ? { ...n, color } : n)));
  }, [editorNodeId, nodes, onNodesChange]);

  // 마우스 이동 추적 (연결 모드용 + 드래그/팬)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 연결 모드: 마우스 위치 추적
      if (connectSource) {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const cx = (e.clientX - rect.left - canvasOffset[0]) / canvasZoom;
          const cy = (e.clientY - rect.top - canvasOffset[1]) / canvasZoom;
          setMouseCanvas({ x: cx, y: cy });
        }
        return;
      }
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
      }
    };

    const handleMouseUp = () => {
      // 연결 모드에서는 mouseup으로 아무것도 안 함 (클릭 기반이므로)
      if (connectSource) return;
      setDragging(null);
      setPanning(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, panning, connectSource, nodes, canvasOffset, canvasZoom, onNodesChange, onCanvasOffsetChange]);

  // 캔버스 빈 영역 클릭
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // 연결 모드 중 캔버스 클릭 → 취소
    if (connectSource) {
      setConnectSource(null);
      setMouseCanvas(null);
      return;
    }
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas === 'true') {
      setPanning({ startX: e.clientX, startY: e.clientY, offsetStart: [...canvasOffset] });
      setSelectedNodeId(null);
    }
  }, [canvasOffset, connectSource]);

  // Esc로 연결 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectSource) {
        setConnectSource(null);
        setMouseCanvas(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectSource]);

  // 컨테이너 크기 추적
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 줌
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.max(0.3, Math.min(2.0, canvasZoom + delta));
    onCanvasZoomChange(newZoom);
  }, [canvasZoom, onCanvasZoomChange]);

  const bg = isDarkMode ? 'bg-gray-950' : 'bg-gray-100';
  const editorNode = editorNodeId ? nodes.find((n) => n.id === editorNodeId) : null;

  // 연결 모드 임시 선
  const connectingLine = (() => {
    if (!connectSource || !mouseCanvas) return null;
    const sourceNode = nodes.find((n) => n.id === connectSource.nodeId);
    if (!sourceNode) return null;
    const [sx, sy] = getAnchor(sourceNode, connectSource.side);
    return (
      <line x1={sx} y1={sy} x2={mouseCanvas.x} y2={mouseCanvas.y}
        stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" />
    );
  })();

  return (
    <div className={`flex-1 relative overflow-hidden ${bg}`} ref={containerRef}>
      <div
        data-canvas="true"
        className={`absolute inset-0 ${connectSource ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
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
        <div
          style={{
            transform: `translate(${canvasOffset[0]}px, ${canvasOffset[1]}px) scale(${canvasZoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG 엣지 - width/height를 1로 설정하고 overflow:visible로 전체 렌더링 */}
          <svg className="absolute top-0 left-0 pointer-events-none" width="1" height="1" style={{ overflow: 'visible' }}>
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
                    sourceSide={edge.sourceSide || 'right'}
                    targetNode={tn}
                    targetSide={edge.targetSide || 'left'}
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
              connectingFromNodeId={connectSource?.nodeId ?? null}
              onSelect={handleSelectNode}
              onDragStart={handleNodeDragStart}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
              onDelete={handleDeleteNode}
              onConnectorClick={handleConnectorClick}
            />
          ))}
        </div>
      </div>

      {/* 줌 표시 + 연결 모드 안내 */}
      <div className={`absolute bottom-4 left-4 flex items-center gap-2 text-[12px] font-medium px-3 py-2 rounded-xl border backdrop-blur-sm ${
        isDarkMode
          ? 'bg-gray-900/80 border-gray-700 text-gray-400'
          : 'bg-white/80 border-gray-200 text-gray-500'
      }`}>
        {connectSource ? (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>연결할 노드의 커넥터를 클릭하세요</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>Esc</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{Math.round(canvasZoom * 100)}%</span>
          </>
        )}
      </div>

      {/* 미니맵 */}
      <WorkflowMinimap
        nodes={nodes}
        edges={edges}
        canvasOffset={canvasOffset}
        canvasZoom={canvasZoom}
        containerWidth={containerSize.w}
        containerHeight={containerSize.h}
        isDarkMode={isDarkMode}
        onCanvasOffsetChange={onCanvasOffsetChange}
      />

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
          onColorChange={handleColorChange}
          onLinksChange={handleLinksChange}
          onUploadFile={(file) => onUploadFile(editorNode.id, file)}
          onDeleteAttachment={onDeleteAttachment}
          getDownloadUrl={getDownloadUrl}
        />
      )}
    </div>
  );
}
