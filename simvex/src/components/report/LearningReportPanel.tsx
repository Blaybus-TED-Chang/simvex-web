'use client';

import { useState, useRef, useCallback } from 'react';

interface ReportData {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  weakParts: string[];
  recommendations: string[];
  summary: string;
}

interface LearningReportPanelProps {
  modelId: string;
  modelInfo: {
    name: string;
    nameKo: string;
    description: string;
    category: string;
  };
  parts: { id: string; nameKo: string; description: string }[];
  quizData?: { score: number; total: number; wrongPartIds: string[] };
  notesContent?: string;
  chatHistory?: string;
  isDarkMode?: boolean;
  onHighlightParts?: (partIds: string[]) => void;
}

export function LearningReportPanel({
  modelId,
  modelInfo,
  parts,
  quizData,
  notesContent,
  chatHistory,
  isDarkMode,
  onHighlightParts,
}: LearningReportPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightActive, setHighlightActive] = useState(false);
  const cacheRef = useRef<Record<string, ReportData>>({});

  const handleGenerate = useCallback(async () => {
    // 캐시 확인
    if (cacheRef.current[modelId]) {
      setReport(cacheRef.current[modelId]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelInfo,
          parts,
          quizData,
          notesContent,
          chatHistory,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '리포트 생성에 실패했습니다.');
      }

      const data: ReportData = await res.json();
      setReport(data);
      cacheRef.current[modelId] = data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelInfo, parts, quizData, notesContent, chatHistory]);

  const handleHighlightWeakParts = useCallback(() => {
    if (!report || !onHighlightParts) return;
    if (highlightActive) {
      onHighlightParts([]);
      setHighlightActive(false);
    } else {
      onHighlightParts(report.weakParts);
      setHighlightActive(true);
    }
  }, [report, onHighlightParts, highlightActive]);

  // 점수에 따른 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // 원형 게이지 SVG
  const ScoreGauge = ({ score }: { score: number }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
      <div className="flex flex-col items-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text
            x="60" y="55"
            textAnchor="middle"
            className={`text-2xl font-bold ${isDarkMode ? 'fill-white' : 'fill-gray-900'}`}
            style={{ fontSize: '28px', fontWeight: 700 }}
          >
            {score}
          </text>
          <text
            x="60" y="75"
            textAnchor="middle"
            className={isDarkMode ? 'fill-gray-400' : 'fill-gray-500'}
            style={{ fontSize: '12px' }}
          >
            / 100
          </text>
        </svg>
      </div>
    );
  };

  // 초기 상태: 생성 버튼
  if (!report && !isLoading && !error) {
    return (
      <div className={`p-4 space-y-4 min-h-full ${isDarkMode ? '' : 'bg-[#F0F4FF]'}`} style={{ animation: 'fadeIn 0.2s ease' }}>
        <div className={`rounded-2xl border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
          <div className="mb-4">
            <svg className={`w-12 h-12 mx-auto ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className={`text-[15px] font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            AI 학습 리포트
          </h3>
          <p className={`text-[12px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            퀴즈 성적, 노트, AI 채팅 데이터를 분석하여<br />
            맞춤형 학습 리포트를 생성합니다.
          </p>
          <div className={`text-[11px] mb-4 space-y-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>
              {quizData ? `퀴즈: ${quizData.score}/${quizData.total}점` : '퀴즈: 데이터 없음'}
            </p>
            <p>
              {notesContent ? `노트: ${Math.min(notesContent.length, 2000)}자` : '노트: 데이터 없음'}
            </p>
            <p>
              {chatHistory ? `채팅: ${Math.min(chatHistory.length, 2000)}자` : '채팅: 데이터 없음'}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
          >
            리포트 생성
          </button>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`p-4 space-y-4 min-h-full ${isDarkMode ? '' : 'bg-[#F0F4FF]'}`}>
        <div className={`rounded-2xl border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80'}`}>
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className={`text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            AI가 학습 데이터를 분석 중...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`p-4 space-y-4 min-h-full ${isDarkMode ? '' : 'bg-[#F0F4FF]'}`}>
        <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-gray-800 border-red-800' : 'bg-white border-red-200'}`}>
          <p className={`text-[13px] text-red-500 mb-3`}>{error}</p>
          <button
            onClick={() => { setError(null); handleGenerate(); }}
            className="px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 리포트 결과
  if (!report) return null;

  const partNameMap = new Map(parts.map(p => [p.id, p.nameKo]));

  return (
    <div className={`p-4 space-y-3 min-h-full ${isDarkMode ? '' : 'bg-[#F0F4FF]'}`} style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* 종합 점수 */}
      <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
        <h3 className={`text-[14px] font-bold mb-3 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          종합 학습 점수
        </h3>
        <ScoreGauge score={report.overallScore} />
      </div>

      {/* 강점 */}
      {report.strengths.length > 0 && (
        <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
          <h4 className={`text-[13px] font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            강점
          </h4>
          <ul className="space-y-1.5">
            {report.strengths.map((s, i) => (
              <li key={i} className={`text-[12px] flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="text-green-500 mt-0.5 shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 약점 */}
      {report.weaknesses.length > 0 && (
        <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
          <h4 className={`text-[13px] font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            약점
          </h4>
          <ul className="space-y-1.5">
            {report.weaknesses.map((w, i) => (
              <li key={i} className={`text-[12px] flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="text-red-500 mt-0.5 shrink-0">!</span>
                {w}
              </li>
            ))}
          </ul>
          {/* 약점 부품 하이라이트 */}
          {report.weakParts.length > 0 && onHighlightParts && (
            <button
              onClick={handleHighlightWeakParts}
              className={`mt-3 w-full px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                highlightActive
                  ? 'bg-red-500 text-white'
                  : isDarkMode
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {highlightActive ? '하이라이트 해제' : `약점 부품 하이라이트 (${report.weakParts.length}개)`}
            </button>
          )}
          {report.weakParts.length > 0 && (
            <div className={`mt-2 flex flex-wrap gap-1`}>
              {report.weakParts.map(id => (
                <span
                  key={id}
                  className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                    isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {partNameMap.get(id) || id}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 학습 추천 */}
      {report.recommendations.length > 0 && (
        <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
          <h4 className={`text-[13px] font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            맞춤 학습 추천
          </h4>
          <ol className="space-y-2">
            {report.recommendations.map((r, i) => (
              <li key={i} className={`text-[12px] flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 종합 평가 */}
      {report.summary && (
        <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'}`}>
          <h4 className={`text-[13px] font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            종합 평가
          </h4>
          <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {report.summary}
          </p>
        </div>
      )}

      {/* 다시 생성 버튼 */}
      <div className="text-center pt-1">
        <button
          onClick={() => {
            delete cacheRef.current[modelId];
            setReport(null);
            setHighlightActive(false);
            onHighlightParts?.([]);
            handleGenerate();
          }}
          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          리포트 다시 생성
        </button>
      </div>
    </div>
  );
}
