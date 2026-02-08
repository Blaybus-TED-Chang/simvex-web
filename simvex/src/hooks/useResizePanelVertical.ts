'use client';

import { useState, useCallback, useRef } from 'react';

interface UseResizePanelVerticalOptions {
  min: number;
  max: number;
  initial: number;
}

export function useResizePanelVertical(options: UseResizePanelVerticalOptions) {
  const { min, max, initial } = options;
  const [height, setHeight] = useState(initial);
  const isResizing = useRef(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ns-resize;';
    document.body.appendChild(overlay);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const dynamicMax = Math.min(max, window.innerHeight * 0.6);
      const rawHeight = window.innerHeight - e.clientY;
      setHeight(Math.max(min, Math.min(dynamicMax, rawHeight)));
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
  }, [min, max]);

  return { height, handleResizeStart };
}
