'use client';

import { useState } from 'react';

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

  if (!model) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">제품 정보</h3>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-lg font-bold text-white">{model.nameKo}</h4>
          <p className="text-xs text-gray-400">{model.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
            {model.category}
          </span>
          <span className="text-xs text-gray-500">
            {model.parts.length}개 부품
          </span>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed">
          {model.description}
        </p>

        {/* 관련 이론 */}
        <div className="border-t border-gray-700 pt-3">
          <button
            onClick={() => setIsTheoryExpanded(!isTheoryExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-300">관련 이론</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
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
            <div className="mt-2 text-sm text-gray-400 whitespace-pre-line leading-relaxed">
              {model.theory}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
