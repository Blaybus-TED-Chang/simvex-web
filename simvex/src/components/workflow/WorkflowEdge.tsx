'use client';

import React from 'react';
import type { WorkflowNode, ConnectorSide } from '@/types/workflow';

interface WorkflowEdgeProps {
  id: string;
  sourceNode: WorkflowNode;
  sourceSide: ConnectorSide;
  targetNode: WorkflowNode;
  targetSide: ConnectorSide;
  isOwner: boolean;
  onDelete: (id: string) => void;
}

const NODE_H = 120;

/** 커넥터 방향별 노드 위의 앵커 좌표 */
function getAnchor(node: WorkflowNode, side: ConnectorSide): [number, number] {
  switch (side) {
    case 'left':   return [node.x, node.y + NODE_H / 2];
    case 'right':  return [node.x + node.width, node.y + NODE_H / 2];
    case 'top':    return [node.x + node.width / 2, node.y];
    case 'bottom': return [node.x + node.width / 2, node.y + NODE_H];
  }
}

/** 베지어 컨트롤 포인트 오프셋 */
function getControlOffset(side: ConnectorSide, dist: number): [number, number] {
  const d = Math.max(40, dist * 0.4);
  switch (side) {
    case 'left':   return [-d, 0];
    case 'right':  return [d, 0];
    case 'top':    return [0, -d];
    case 'bottom': return [0, d];
  }
}

export function WorkflowEdge({ id, sourceNode, sourceSide, targetNode, targetSide, isOwner, onDelete }: WorkflowEdgeProps) {
  const [sx, sy] = getAnchor(sourceNode, sourceSide);
  const [tx, ty] = getAnchor(targetNode, targetSide);
  const dist = Math.hypot(tx - sx, ty - sy);
  const [scx, scy] = getControlOffset(sourceSide, dist);
  const [tcx, tcy] = getControlOffset(targetSide, dist);

  const d = `M ${sx} ${sy} C ${sx + scx} ${sy + scy}, ${tx + tcx} ${ty + tcy}, ${tx} ${ty}`;
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;

  return (
    <g className="group">
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} className="cursor-pointer" />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
        className="text-gray-400 group-hover:text-[#001AFF] transition-colors pointer-events-none"
      />
      {isOwner && (
        <foreignObject x={midX - 11} y={midY - 11} width={22} height={22}
          className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(id)}
            className="w-[22px] h-[22px] bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </foreignObject>
      )}
    </g>
  );
}
