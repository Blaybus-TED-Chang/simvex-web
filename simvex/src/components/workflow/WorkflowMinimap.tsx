'use client';

import React, { useMemo, useCallback, useRef } from 'react';
import type { WorkflowNode, WorkflowEdge as WEdge } from '@/types/workflow';

const MINIMAP_W = 200;
const MINIMAP_H = 140;
const NODE_H = 120;
const PADDING = 60;

interface WorkflowMinimapProps {
  nodes: WorkflowNode[];
  edges: WEdge[];
  canvasOffset: number[];
  canvasZoom: number;
  containerWidth: number;
  containerHeight: number;
  isDarkMode: boolean;
  onCanvasOffsetChange: (offset: number[]) => void;
}

export function WorkflowMinimap({
  nodes,
  edges,
  canvasOffset,
  canvasZoom,
  containerWidth,
  containerHeight,
  isDarkMode,
  onCanvasOffsetChange,
}: WorkflowMinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // 전체 노드 바운딩 박스 + 뷰포트 영역 통합
  const bounds = useMemo(() => {
    // 뷰포트 영역 (캔버스 좌표)
    const vpX = -canvasOffset[0] / canvasZoom;
    const vpY = -canvasOffset[1] / canvasZoom;
    const vpW = containerWidth / canvasZoom;
    const vpH = containerHeight / canvasZoom;

    let minX = vpX;
    let minY = vpY;
    let maxX = vpX + vpW;
    let maxY = vpY + vpH;

    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + NODE_H > maxY) maxY = n.y + NODE_H;
    }

    minX -= PADDING;
    minY -= PADDING;
    maxX += PADDING;
    maxY += PADDING;

    const bw = maxX - minX || 1;
    const bh = maxY - minY || 1;
    const scale = Math.min(MINIMAP_W / bw, MINIMAP_H / bh);

    return { minX, minY, bw, bh, scale };
  }, [nodes, canvasOffset, canvasZoom, containerWidth, containerHeight]);

  // 캔버스 좌표 → 미니맵 좌표
  const toMinimap = useCallback(
    (cx: number, cy: number) => [
      (cx - bounds.minX) * bounds.scale,
      (cy - bounds.minY) * bounds.scale,
    ],
    [bounds],
  );

  // 뷰포트 사각형 (미니맵 좌표)
  const viewport = useMemo(() => {
    const vpX = -canvasOffset[0] / canvasZoom;
    const vpY = -canvasOffset[1] / canvasZoom;
    const vpW = containerWidth / canvasZoom;
    const vpH = containerHeight / canvasZoom;
    const [mx, my] = toMinimap(vpX, vpY);
    return { x: mx, y: my, w: vpW * bounds.scale, h: vpH * bounds.scale };
  }, [canvasOffset, canvasZoom, containerWidth, containerHeight, toMinimap, bounds.scale]);

  // 엣지 앵커 계산 (WorkflowCanvas의 getAnchor와 동일)
  const getAnchor = useCallback(
    (node: WorkflowNode, side: string): [number, number] => {
      switch (side) {
        case 'left':   return [node.x, node.y + NODE_H / 2];
        case 'right':  return [node.x + node.width, node.y + NODE_H / 2];
        case 'top':    return [node.x + node.width / 2, node.y];
        case 'bottom': return [node.x + node.width / 2, node.y + NODE_H];
        default:       return [node.x, node.y];
      }
    },
    [],
  );

  // 미니맵 클릭 → 캔버스 오프셋 이동
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // 미니맵 좌표 → 캔버스 좌표
      const cx = mx / bounds.scale + bounds.minX;
      const cy = my / bounds.scale + bounds.minY;

      // 클릭 위치가 뷰포트 중앙이 되도록 오프셋 계산
      const newOffsetX = -(cx - containerWidth / canvasZoom / 2) * canvasZoom;
      const newOffsetY = -(cy - containerHeight / canvasZoom / 2) * canvasZoom;
      onCanvasOffsetChange([newOffsetX, newOffsetY]);
    },
    [bounds, canvasZoom, containerWidth, containerHeight, onCanvasOffsetChange],
  );

  if (nodes.length === 0) return null;

  const actualW = bounds.bw * bounds.scale;
  const actualH = bounds.bh * bounds.scale;

  return (
    <div
      className={`absolute bottom-4 right-4 rounded-lg shadow border overflow-hidden ${
        isDarkMode
          ? 'bg-gray-900/80 border-gray-700'
          : 'bg-white/80 border-gray-300'
      }`}
      style={{ width: MINIMAP_W, height: MINIMAP_H }}
    >
      <svg
        ref={svgRef}
        width={MINIMAP_W}
        height={MINIMAP_H}
        viewBox={`0 0 ${actualW} ${actualH}`}
        className="cursor-pointer"
        onClick={handleClick}
      >
        {/* 엣지 */}
        {edges.map((edge) => {
          const sn = nodes.find((n) => n.id === edge.sourceNodeId);
          const tn = nodes.find((n) => n.id === edge.targetNodeId);
          if (!sn || !tn) return null;
          const [sx, sy] = getAnchor(sn, edge.sourceSide || 'right');
          const [tx, ty] = getAnchor(tn, edge.targetSide || 'left');
          const [msx, msy] = toMinimap(sx, sy);
          const [mtx, mty] = toMinimap(tx, ty);
          return (
            <line
              key={edge.id}
              x1={msx} y1={msy} x2={mtx} y2={mty}
              stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
              strokeWidth={1}
            />
          );
        })}

        {/* 노드 */}
        {nodes.map((n) => {
          const [mx, my] = toMinimap(n.x, n.y);
          const mw = n.width * bounds.scale;
          const mh = NODE_H * bounds.scale;
          return (
            <rect
              key={n.id}
              x={mx} y={my}
              width={mw} height={mh}
              rx={2}
              fill={n.color || (isDarkMode ? '#60a5fa' : '#3b82f6')}
              opacity={0.8}
            />
          );
        })}

        {/* 뷰포트 */}
        <rect
          x={viewport.x} y={viewport.y}
          width={viewport.w} height={viewport.h}
          fill={isDarkMode ? 'rgba(96,165,250,0.1)' : 'rgba(59,130,246,0.1)'}
          stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
}
