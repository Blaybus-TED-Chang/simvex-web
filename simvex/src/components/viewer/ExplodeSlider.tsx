'use client';

import { useViewerStore } from '@/lib/store/viewerStore';

export function ExplodeSlider() {
  const { explodeValue, setExplodeValue, isDarkMode } = useViewerStore();

  return (
    <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>분해/조립</span>
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{Math.round(explodeValue * 100)}%</span>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>조립</span>
        <input
          type="range"
          min="0"
          max="100"
          value={explodeValue * 100}
          onChange={(e) => setExplodeValue(Number(e.target.value) / 100)}
          className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer
                     ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110`}
        />
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>분해</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setExplodeValue(0)}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          조립
        </button>
        <button
          onClick={() => setExplodeValue(0.5)}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          50%
        </button>
        <button
          onClick={() => setExplodeValue(1)}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          분해
        </button>
      </div>
    </div>
  );
}
