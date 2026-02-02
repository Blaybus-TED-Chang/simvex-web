'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import EngineControls from '@/components/jet-engine/EngineControls';
import EngineLearningPanel from '@/components/jet-engine/EngineLearningPanel';

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

export default function JetEnginePage() {
  const [showLearning, setShowLearning] = useState(false);

  return (
    <div className="simulator-page h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          <div className="w-px h-6 bg-gray-700" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Turbofan Engine Simulator</h1>
              <p className="text-xs text-gray-500">Interactive Jet Engine Visualization</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm">Learn</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <JetEngineScene />

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-sm">
            <p className="text-gray-400">
              <span className="text-gray-300">Controls:</span> Drag to rotate, scroll to zoom
            </p>
            <p className="text-gray-400 mt-1">
              <span className="text-gray-300">Click</span> on engine sections for details
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <EngineControls />
      </div>

      {/* Learning Panel */}
      <EngineLearningPanel isOpen={showLearning} onClose={() => setShowLearning(false)} />
    </div>
  );
}
