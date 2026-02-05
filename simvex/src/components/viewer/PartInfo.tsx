'use client';

import { useViewerStore } from '@/lib/store/viewerStore';

// 공통 부품 정보 인터페이스
interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  color?: string;
}

interface PartInfoProps {
  part: PartInfo | null;
}

export function PartInfo({ part }: PartInfoProps) {
  const { isDarkMode } = useViewerStore();

  if (!part) {
    return (
      <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>부품 정보</h3>
        </div>

        <div className="text-center py-6">
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            부품을 클릭하여 정보를 확인하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>선택된 부품</h3>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{part.nameKo}</h4>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{part.name}</p>
        </div>

        {part.material && (
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>재질:</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{part.material}</span>
          </div>
        )}

        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {part.description}
        </p>

        {part.color && (
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>색상:</span>
            <div
              className={`w-4 h-4 rounded border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
              style={{ backgroundColor: part.color }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
