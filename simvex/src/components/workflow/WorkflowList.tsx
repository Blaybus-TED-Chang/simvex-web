'use client';

import React from 'react';
import type { WorkflowRow } from '@/types/workflow';
import { WorkflowCard } from './WorkflowCard';

interface WorkflowListProps {
  workflows: WorkflowRow[];
  isDarkMode: boolean;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  onRemoveSaved?: (id: string) => void;
}

export function WorkflowList({ workflows, isDarkMode, isOwner, onDelete, onRemoveSaved }: WorkflowListProps) {
  if (workflows.length === 0) {
    return (
      <div className={`text-center py-12 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {isOwner ? '아직 워크플로우가 없습니다.' : '공유받은 워크플로우가 없습니다.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {workflows.map((w) => (
        <WorkflowCard
          key={w.id}
          workflow={w}
          isDarkMode={isDarkMode}
          isOwner={isOwner}
          onDelete={onDelete}
          onRemoveSaved={onRemoveSaved}
        />
      ))}
    </div>
  );
}
