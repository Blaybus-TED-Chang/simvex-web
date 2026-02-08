'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useViewerStore } from '@/lib/store/viewerStore';

interface Pos { top: number; left: number }

function TooltipBubble({ label, pos }: { label: string; pos: Pos }) {
  const isDarkMode = useViewerStore((s) => s.isDarkMode);
  return createPortal(
    <div
      className={`fixed px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg pointer-events-none ${
        isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-white'
      }`}
      style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 99999 }}
    >
      {label}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
          isDarkMode ? 'border-b-gray-700' : 'border-b-gray-800'
        }`}
      />
    </div>,
    document.body,
  );
}

function useTooltipPos() {
  const ref = useRef<HTMLDivElement | HTMLSpanElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  const onEnter = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
  }, []);

  const onLeave = useCallback(() => setPos(null), []);

  return { ref, pos, onEnter, onLeave };
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const { ref, pos, onEnter, onLeave } = useTooltipPos();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {pos && <TooltipBubble label={label} pos={pos} />}
    </div>
  );
}

/** Inline tooltip that doesn't wrap children in a div — uses a span wrapper instead */
export function InlineTooltip({ label, children }: { label: string; children: ReactNode }) {
  const { ref, pos, onEnter, onLeave } = useTooltipPos();
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {pos && <TooltipBubble label={label} pos={pos} />}
    </span>
  );
}
