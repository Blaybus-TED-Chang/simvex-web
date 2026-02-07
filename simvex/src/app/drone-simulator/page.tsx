'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import DroneControls from '@/components/drone-simulator/DroneControls';
import DroneLearningPanel from '@/components/drone-simulator/DroneLearningPanel';

const DroneSimScene = dynamic(
  () => import('@/components/drone-simulator/DroneSimScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Drone Model...</p>
        </div>
      </div>
    ),
  },
);

export default function DroneSimulatorPage() {
  const [showLearning, setShowLearning] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const isResizing = useRef(false);

  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
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
    <div className="simulator-page h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          <div className="w-px h-6 bg-gray-700" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">SIMVEX 드론 시뮬레이터</h1>
              <p className="text-xs text-gray-500">Quadcopter Flight Simulator</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowLearning(!showLearning)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            showLearning
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-sm">Learn</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 min-w-0 relative">
          <DroneSimScene />

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-sm">
            <p className="text-gray-400">
              <span className="text-gray-300">Controls:</span> Drag to rotate, scroll to zoom
            </p>
            <p className="text-gray-400 mt-1">
              <span className="text-gray-300">Throttle</span>을 올려 프로펠러를 회전시키세요
            </p>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1.5 flex-shrink-0 cursor-ew-resize bg-gray-800 hover:bg-blue-600 active:bg-blue-500 transition-colors"
          onMouseDown={handleSidebarResizeStart}
        />

        {/* Control Panel */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{ width: sidebarWidth, minWidth: 240, maxWidth: 600 }}
        >
          <DroneControls />
        </div>
      </div>

      {/* Learning Panel */}
      <DroneLearningPanel isOpen={showLearning} onClose={() => setShowLearning(false)} />
    </div>
  );
}
