'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function PartTagComponent({ node }: NodeViewProps) {
  const { partId, partName } = node.attrs;

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent('partTagClick', { detail: { partId } })
    );
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium
                   bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                   hover:bg-cyan-500/30 transition-colors cursor-pointer"
        contentEditable={false}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        {partName}
      </button>
    </NodeViewWrapper>
  );
}
