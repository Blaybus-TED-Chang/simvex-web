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
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {workflows.map((w, i) => (
        <div key={w.id} style={{ animation: `fadeInUp 0.35s ease ${i * 0.06}s both` }}>
          <WorkflowCard
            workflow={w}
            isDarkMode={isDarkMode}
            isOwner={isOwner}
            onDelete={onDelete}
            onRemoveSaved={onRemoveSaved}
          />
        </div>
      ))}
    </div>
  );
}
