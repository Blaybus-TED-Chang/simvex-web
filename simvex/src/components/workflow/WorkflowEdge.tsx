'use client';

import React from 'react';
import type { WorkflowNode } from '@/types/workflow';

interface WorkflowEdgeProps {
  id: string;
  sourceNode: WorkflowNode;
  targetNode: WorkflowNode;
  isOwner: boolean;
  onDelete: (id: string) => void;
}

const NODE_HEIGHT = 120;

export function WorkflowEdge({ id, sourceNode, targetNode, isOwner, onDelete }: WorkflowEdgeProps) {
  const sx = sourceNode.x + sourceNode.width;
  const sy = sourceNode.y + NODE_HEIGHT / 2;
  const tx = targetNode.x;
  const ty = targetNode.y + NODE_HEIGHT / 2;
  const dx = Math.abs(tx - sx) * 0.5;

  const d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;

  return (
    <g className="group">
      {/* 넓은 히트 영역 */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} className="cursor-pointer" />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
        className="text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none"
      />
      {isOwner && (
        <foreignObject x={midX - 10} y={midY - 10} width={20} height={20}
          className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(id)}
            className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >
            X
          </button>
        </foreignObject>
      )}
    </g>
  );
}
