'use client';

import { useEffect } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';

// 공통 부품 정보 인터페이스
interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  color?: string;
}

interface PartsListProps {
  parts: PartInfo[];
}

export function PartsList({ parts }: PartsListProps) {
  const {
    visibleParts,
    selectedPartId,
    togglePartVisibility,
    setAllPartsVisible,
    setSelectedPartId,
    isDarkMode,
  } = useViewerStore();

  // 초기 로드 시 모든 부품 표시
  useEffect(() => {
    if (visibleParts.length === 0) {
      setAllPartsVisible(parts.map((p) => p.id));
    }
  }, [parts, visibleParts.length, setAllPartsVisible]);

  const allVisible = parts.every((p) => visibleParts.includes(p.id));

  return (
    <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>부품 목록</h3>
        </div>

        <button
          onClick={() => {
            if (allVisible) {
              setAllPartsVisible([]);
            } else {
              setAllPartsVisible(parts.map((p) => p.id));
            }
          }}
          className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {allVisible ? '모두 숨김' : '모두 표시'}
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {parts.map((part) => {
          const isVisible = visibleParts.includes(part.id);
          const isSelected = selectedPartId === part.id;

          return (
            <div
              key={part.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
                ${isSelected
                  ? isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50 border border-blue-200'
                  : isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                }`}
              onClick={() => setSelectedPartId(part.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePartVisibility(part.id);
                }}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                  ${isVisible
                    ? 'bg-blue-500 border-blue-500'
                    : isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {isVisible && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${
                  isSelected
                    ? isDarkMode ? 'text-white font-medium' : 'text-blue-700 font-medium'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {part.nameKo}
                </p>
                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{part.name}</p>
              </div>

              {part.color && (
                <div
                  className={`w-3 h-3 rounded-full border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  style={{ backgroundColor: part.color }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
