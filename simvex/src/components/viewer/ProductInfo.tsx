'use client';

import { useState } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';

// 공통 모델 정보 인터페이스
interface ModelInfo {
  nameKo: string;
  name: string;
  category: string;
  description: string;
  theory: string;
  parts: { id: string }[];
}

interface ProductInfoProps {
  model: ModelInfo | null;
}

export function ProductInfo({ model }: ProductInfoProps) {
  const [isTheoryExpanded, setIsTheoryExpanded] = useState(false);
  const { isDarkMode } = useViewerStore();

  if (!model) return null;

  return (
    <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>제품 정보</h3>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{model.nameKo}</h4>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{model.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            {model.category}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {model.parts.length}개 부품
          </span>
        </div>

        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {model.description}
        </p>

        {/* 관련 이론 */}
        <div className={`border-t pt-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setIsTheoryExpanded(!isTheoryExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>관련 이론</span>
            <svg
              className={`w-4 h-4 transition-transform ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${
                isTheoryExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isTheoryExpanded && (
            <div className={`mt-2 text-sm whitespace-pre-line leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {model.theory}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
