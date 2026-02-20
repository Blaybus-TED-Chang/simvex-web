'use client';

export interface ComparePartData {
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  color?: string;
}

export interface ComparisonResult {
  roleDifference: string;
  materialComparison: string;
  interaction: string;
  structuralImportance: string;
  summary: string;
}

interface PartCompareModalProps {
  partA: ComparePartData;
  partB: ComparePartData;
  comparison: ComparisonResult | null;
  isLoading: boolean;
  error: string | null;
  isDarkMode?: boolean;
  onClose: () => void;
}

const sections = [
  { key: 'roleDifference' as const, label: '역할 차이', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'materialComparison' as const, label: '재질 비교', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { key: 'interaction' as const, label: '상호작용', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { key: 'structuralImportance' as const, label: '구조적 중요도', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];

export function PartCompareModal({ partA, partB, comparison, isLoading, error, isDarkMode, onClose }: PartCompareModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}
        style={{ animation: 'scaleIn 0.25s ease both' }}
      >
        {/* 헤더 */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            부품 비교 분석
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 부품 비교 헤더 */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            {/* Part A */}
            <div className={`flex-1 rounded-xl p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: partA.color || '#3B82F6' }} />
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{partA.nameKo}</p>
                  <p className="text-xs text-gray-400 truncate">{partA.name}</p>
                </div>
              </div>
            </div>

            <span className={`text-sm font-bold shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>VS</span>

            {/* Part B */}
            <div className={`flex-1 rounded-xl p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-100'}`}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: partB.color || '#8B5CF6' }} />
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{partB.nameKo}</p>
                  <p className="text-xs text-gray-400 truncate">{partB.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 pb-6">
          {/* 로딩 */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI가 두 부품을 비교 분석하고 있습니다...</p>
            </div>
          )}

          {/* 에러 */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-10 h-10 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* 분석 결과 */}
          {comparison && !isLoading && (
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.key}
                  className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                    </svg>
                    <h3 className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{section.label}</h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comparison[section.key]}
                  </p>
                </div>
              ))}

              {/* 요약 */}
              <div className={`rounded-xl border-2 p-4 ${isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className={`text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>핵심 요약</h3>
                </div>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                  {comparison.summary}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
