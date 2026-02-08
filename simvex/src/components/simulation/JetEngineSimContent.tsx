'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EngineControls from '@/components/jet-engine/EngineControls';
import EngineLearningPanel from '@/components/jet-engine/EngineLearningPanel';
import { ControlsHelp } from '@/components/ui/ControlsHelp';

const JetEngineScene = dynamic(() => import('@/components/jet-engine/JetEngineScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading Engine Model...</p>
      </div>
    </div>
  ),
});

const JET_ENGINE_CONTROLS_GUIDE = [
  { icon: '🖱️ 좌클릭 드래그', desc: '회전' },
  { icon: '🖱️ 우클릭 드래그', desc: '이동 (팬)' },
  { icon: '🔄 스크롤', desc: '줌 인/아웃' },
  { icon: '👆 엔진 섹션 클릭', desc: '상세 정보 표시' },
];

interface JetEngineSimContentProps {
  isDarkMode: boolean;
  showLearning: boolean;
  onCloseLearning: () => void;
}

export default function JetEngineSimContent({ isDarkMode, showLearning, onCloseLearning }: JetEngineSimContentProps) {
  const [showControls, setShowControls] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const isResizing = useRef(false);

  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize;';
    document.body.appendChild(overlay);

    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - ev.clientX;
      setSidebarWidth(Math.max(240, Math.min(600, newWidth)));
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      overlay.remove();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 min-w-0 relative">
          <JetEngineScene isDarkMode={isDarkMode} />
          <ControlsHelp show={showControls} onDismiss={() => setShowControls(false)} isDarkMode={isDarkMode} controls={JET_ENGINE_CONTROLS_GUIDE} />
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1.5 flex-shrink-0 cursor-ew-resize ${isDarkMode ? 'bg-gray-800 hover:bg-blue-600 active:bg-blue-500' : 'bg-gray-200 hover:bg-blue-500 active:bg-blue-400'} transition-colors`}
          onMouseDown={handleSidebarResizeStart}
        />

        {/* Control Panel */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{ width: sidebarWidth, minWidth: 240, maxWidth: 600 }}
        >
          <EngineControls isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Learning Panel */}
      <EngineLearningPanel isOpen={showLearning} onClose={onCloseLearning} isDarkMode={isDarkMode} />
    </>
  );
}
