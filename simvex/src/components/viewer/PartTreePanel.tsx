'use client';

import { CombinedPartConfig } from '@/components/viewer/CombinedGLBPart';

interface PartTreePanelProps {
  isDarkMode: boolean;
  modelNameKo: string;
  parts: CombinedPartConfig[];
  selectedPartId: string | null;
  focusedPartId: string | null;
  onFocusPart: (partId: string | null) => void;
  onSelectPart: (partId: string | null) => void;
}

export function PartTreePanel({
  isDarkMode,
  modelNameKo,
  parts,
  selectedPartId,
  focusedPartId,
  onFocusPart,
  onSelectPart,
}: PartTreePanelProps) {
  const handleRootClick = () => {
    onFocusPart(null);
    onSelectPart(null);
  };

  const handlePartClick = (partId: string) => {
    onFocusPart(partId);
    onSelectPart(partId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className={`px-3 py-2 border-b flex-shrink-0 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          부품 트리
        </h3>
      </div>

      {/* 트리 목록 */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* 최상위: 모델 전체 */}
        <button
          onClick={handleRootClick}
          className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm transition-colors ${
            !focusedPartId
              ? isDarkMode
                ? 'bg-blue-900/30 text-blue-300'
                : 'bg-blue-50 text-blue-700'
              : isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="font-medium truncate">{modelNameKo}</span>
        </button>

        {/* 하위: 각 부품 */}
        {parts.map((part) => {
          const isActive = focusedPartId === part.id;
          const isSelected = selectedPartId === part.id;

          return (
            <button
              key={part.id}
              onClick={() => handlePartClick(part.id)}
              className={`w-full text-left pl-7 pr-3 py-1.5 flex items-center gap-2 text-sm transition-colors ${
                isActive
                  ? isDarkMode
                    ? 'bg-blue-900/30 text-blue-300'
                    : 'bg-blue-50 text-blue-700'
                  : isSelected
                    ? isDarkMode
                      ? 'bg-gray-800 text-gray-200'
                      : 'bg-gray-100 text-gray-800'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {/* 색상 점 */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 border"
                style={{
                  backgroundColor: part.color || '#888888',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                }}
              />
              <span className="truncate">{part.nameKo}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
