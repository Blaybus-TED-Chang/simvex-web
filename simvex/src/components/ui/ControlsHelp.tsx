'use client';

import { useState, useEffect } from 'react';

interface ControlsHelpProps {
  show: boolean;
  onDismiss: () => void;
  isDarkMode: boolean;
  controls: { icon: string; desc: string }[];
}

export function ControlsHelp({ show, onDismiss, isDarkMode, controls }: ControlsHelpProps) {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (show) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOpacity(1));
      });
    } else {
      setOpacity(0);
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className="absolute bottom-4 left-4 z-30 pointer-events-auto select-none"
      style={{ opacity, transition: 'opacity 0.5s ease-in-out' }}
    >
      <div className={`rounded-xl px-4 py-3 backdrop-blur-md shadow-lg ${
        isDarkMode
          ? 'bg-gray-800/80 border border-gray-700/50'
          : 'bg-white/80 border border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            조작 가이드
          </p>
          <button
            onClick={onDismiss}
            className={`p-0.5 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-1.5">
          {controls.map((c) => (
            <div key={c.desc} className="flex items-center gap-2 text-xs">
              <span className={`w-28 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{c.icon}</span>
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
