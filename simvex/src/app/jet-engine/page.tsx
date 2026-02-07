'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import EngineControls from '@/components/jet-engine/EngineControls';
import EngineLearningPanel from '@/components/jet-engine/EngineLearningPanel';
import { useViewerStore } from '@/lib/store/viewerStore';
import { useUser } from '@/hooks/useUser';
import { AuthButton } from '@/components/auth/AuthButton';
import { ExportPdfButton } from '@/components/export/ExportPdfButton';
import { NotesPanel } from '@/components/viewer/NotesPanel';
import { ENGINE_SECTIONS } from '@/types/jetEngine';

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

const JET_ENGINE_MODEL_INFO = {
  name: 'Turbofan Engine Simulator',
  nameKo: '터보팬 엔진 시뮬레이터',
  description: 'CFM56급 터보팬 엔진 시뮬레이터 — 스로틀, 고도, 마하수를 조절하여 엔진 성능 변화를 체험합니다.',
  theory: '터보팬 엔진은 흡입-압축-연소-팽창-배기의 브레이튼 사이클로 작동합니다. 높은 바이패스비로 연료 효율과 소음을 개선합니다.',
  category: '항공',
};

const JET_ENGINE_PARTS = ENGINE_SECTIONS.map((s) => ({
  nameKo: s.name,
  name: s.name,
  description: s.description,
}));

export default function JetEnginePage() {
  const [showLearning, setShowLearning] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [notesPanelWidth, setNotesPanelWidth] = useState(384);
  const isResizing = useRef(false);
  const isNotesPanelResizing = useRef(false);

  const { isDarkMode, toggleDarkMode, notes } = useViewerStore();
  const { user } = useUser();

  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

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

  const handleNotesPanelResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isNotesPanelResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize;';
    document.body.appendChild(overlay);

    const onMouseMove = (ev: MouseEvent) => {
      if (!isNotesPanelResizing.current) return;
      const newWidth = window.innerWidth - ev.clientX;
      setNotesPanelWidth(Math.max(320, Math.min(800, newWidth)));
    };

    const onMouseUp = () => {
      isNotesPanelResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      overlay.remove();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div className={`simulator-page h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`h-14 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} flex items-center justify-between px-4`}>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SIMVEX"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Turbofan Engine Simulator
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Interactive Jet Engine Visualization
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthButton />

          <ExportPdfButton
            modelNameKo={JET_ENGINE_MODEL_INFO.nameKo}
            modelName={JET_ENGINE_MODEL_INFO.name}
            description={JET_ENGINE_MODEL_INFO.description}
            theory={JET_ENGINE_MODEL_INFO.theory}
            parts={JET_ENGINE_PARTS}
            notes={notes}
            isDarkMode={isDarkMode}
          />

          <button
            onClick={() => setShowLearning(!showLearning)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              showLearning
                ? 'bg-blue-600 text-white'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm">Learn</span>
          </button>

          <button
            onClick={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isNotesPanelOpen
                ? 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 min-w-0 relative">
          <JetEngineScene isDarkMode={isDarkMode} />

          <div className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm rounded-lg p-3 text-sm`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Controls:</span> Drag to rotate, scroll to zoom
            </p>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Click</span> on engine sections for details
            </p>
          </div>
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
      <EngineLearningPanel isOpen={showLearning} onClose={() => setShowLearning(false)} isDarkMode={isDarkMode} />

      {/* Notes Panel (slide) */}
      <div
        className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}
        transform transition-transform duration-300 ease-in-out z-50
        ${isNotesPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: notesPanelWidth }}
      >
        <div
          className={`absolute left-0 top-0 w-1 h-full cursor-ew-resize transition-colors ${
            isDarkMode ? 'hover:bg-blue-400' : 'hover:bg-blue-500'
          }`}
          onMouseDown={handleNotesPanelResizeStart}
        />
        <div className="h-full p-4">
          <NotesPanel
            modelInfo={JET_ENGINE_MODEL_INFO}
            selectedPart={null}
            user={user}
            modelId="jet-engine"
          />
        </div>
      </div>
    </div>
  );
}
