'use client';

export interface FaultDiagnosisResult {
  symptoms: string[];
  cause: string;
  affectedParts: string[];
  severity: 'critical' | 'major' | 'minor';
  repairSuggestion: string;
}

interface FaultDiagnosisModalProps {
  partNameKo: string;
  partName: string;
  partColor?: string;
  diagnosis: FaultDiagnosisResult | null;
  isLoading: boolean;
  error: string | null;
  isDarkMode?: boolean;
  onClose: () => void;
  allParts: { id: string; nameKo: string; color?: string }[];
}

const severityConfig = {
  critical: { label: '심각', bg: 'bg-red-500', text: 'text-white' },
  major: { label: '주요', bg: 'bg-orange-500', text: 'text-white' },
  minor: { label: '경미', bg: 'bg-yellow-400', text: 'text-gray-900' },
};

export function FaultDiagnosisModal({
  partNameKo,
  partName,
  partColor,
  diagnosis,
  isLoading,
  error,
  isDarkMode,
  onClose,
  allParts,
}: FaultDiagnosisModalProps) {
  const sevCfg = diagnosis ? severityConfig[diagnosis.severity] : null;

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
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              고장 진단 시뮬레이션
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 고장 부품 헤더 */}
        <div className="px-6 pt-5 pb-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
            <div className="w-5 h-5 rounded-full shrink-0 border-2 border-red-500" style={{ backgroundColor: partColor || '#EF4444' }} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{partNameKo}</p>
              <p className="text-xs text-gray-400">{partName}</p>
            </div>
            {sevCfg && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sevCfg.bg} ${sevCfg.text}`}>
                {sevCfg.label}
              </span>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 pb-6">
          {isLoading && (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI가 고장 진단 중...</p>
            </div>
          )}

          {error && (
            <div className={`p-4 rounded-xl text-sm ${isDarkMode ? 'bg-red-950/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          {diagnosis && (
            <div className="space-y-4">
              {/* 증상 */}
              <section>
                <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  증상
                </h3>
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <ol className="list-decimal list-inside space-y-1.5">
                    {diagnosis.symptoms.map((s, i) => (
                      <li key={i} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s}</li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* 원인 분석 */}
              <section>
                <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  원인 분석
                </h3>
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{diagnosis.cause}</p>
                </div>
              </section>

              {/* 영향받는 부품 */}
              {diagnosis.affectedParts.length > 0 && (
                <section>
                  <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    영향받는 부품 ({diagnosis.affectedParts.length}개)
                  </h3>
                  <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.affectedParts.map((partId) => {
                        const p = allParts.find((ap) => ap.id === partId);
                        if (!p) return null;
                        return (
                          <div
                            key={partId}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              isDarkMode ? 'bg-orange-950/30 border-orange-800/50 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-800'
                            }`}
                          >
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#ff8800' }} />
                            {p.nameKo}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* 수리 제안 */}
              <section>
                <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  수리 제안
                </h3>
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{diagnosis.repairSuggestion}</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
