'use client';

import { useCallback, useRef, useState } from 'react';

interface UseResizePanelOptions {
  /** 리사이즈 방향: 'left'는 clientX 기준, 'right'는 innerWidth - clientX 기준 */
  direction: 'left' | 'right';
  /** 최소 너비 (px) */
  min: number;
  /** 최대 너비 (px) */
  max: number;
  /** 초기 너비 (px) */
  initial: number;
}

export function useResizePanel(options: UseResizePanelOptions) {
  const { direction, min, max, initial } = options;
  const [width, setWidth] = useState(initial);
  const isResizing = useRef(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize;';
    document.body.appendChild(overlay);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const dynamicMax = Math.min(max, window.innerWidth * 0.8);
      const rawWidth = direction === 'right'
        ? window.innerWidth - e.clientX
        : e.clientX;
      setWidth(Math.max(min, Math.min(dynamicMax, rawWidth)));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      overlay.remove();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, min, max]);

  return { width, handleResizeStart };
}
