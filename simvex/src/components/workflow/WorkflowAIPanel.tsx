'use client';

import React, { useState } from 'react';
import type { AIWorkflowResult } from '@/app/api/workflow/generate/route';

export type { AIWorkflowResult };

interface WorkflowAIPanelProps {
  isDarkMode: boolean;
  workflowTitle: string;
  onClose: () => void;
  onApply: (result: AIWorkflowResult) => void;
}

const EXAMPLE_PROMPTS = [
  '드론 조립 순서를 차트로 만들어줘',
  '로봇팔 동작 단계를 플로우차트로',
  '서스펜션 정비 절차를 정리해줘',
  '판스프링 제조 공정 차트',
];

export function WorkflowAIPanel({ isDarkMode, workflowTitle, onClose, onApply }: WorkflowAIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIWorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/workflow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), workflowTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '생성 실패');
      if (!data.nodes?.length) throw new Error('생성된 노드가 없습니다');
      setResult(data as AIWorkflowResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : '생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    onClose();
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-[360px] z-50 flex flex-col ${
        isDarkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'
      }`}
      style={{ boxShadow: '8px 0 30px rgba(0,0,0,0.12)', animation: 'slideInLeft 0.25s ease both' }}
    >
      {/* 상단 장식 바 */}
      <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 shrink-0" />

      {/* 헤더 */}
      <div className={`flex items-center justify-between px-5 shrink-0 border-b ${
        isDarkMode ? 'border-gray-800' : 'border-gray-100'
      }`} style={{ height: 56 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AI 워크플로우 생성
          </span>
        </div>
        <button
          onClick={onClose}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* 설명 */}
        <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          자연어로 요청하면 AI가 워크플로우 노드와 연결선을 자동 생성합니다. 결과를 확인 후 캔버스에 적용하세요.
        </p>

        {/* 예시 프롬프트 */}
        <div>
          <p className={`text-[11px] font-semibold mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>예시</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-400 hover:border-violet-600 hover:text-violet-400 hover:bg-violet-900/20'
                    : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* 프롬프트 입력 */}
        <div>
          <label className={`block text-[12px] font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            요청 내용
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 드론 조립 순서를 단계별 차트로 만들어줘"
            rows={4}
            className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed outline-none resize-none transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700 text-white focus:border-violet-500 placeholder:text-gray-600'
                : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-violet-400 placeholder:text-gray-300'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
          />
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            Ctrl+Enter로 생성
          </p>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-2.5 text-[13px] font-semibold rounded-xl text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-sm shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              워크플로우 생성
            </>
          )}
        </button>

        {/* 에러 */}
        {error && (
          <div className={`px-3.5 py-3 rounded-xl text-[12px] ${
            isDarkMode
              ? 'bg-red-900/20 text-red-400 border border-red-900/30'
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {error}
          </div>
        )}

        {/* 생성 결과 미리보기 */}
        {result && (
          <div>
            <div className={`flex items-center gap-2 mb-3`}>
              <svg className="w-3.5 h-3.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-[12px] font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.nodes.length}개 노드, {result.edges.length}개 연결 생성됨
              </p>
            </div>

            {/* 노드 목록 */}
            <div className="space-y-2 mb-3">
              {result.nodes.map((node, i) => (
                <div
                  key={i}
                  className={`px-3.5 py-2.5 rounded-xl border-l-[3px] ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                  style={{ borderLeftColor: node.color ?? '#7C3AED' }}
                >
                  <p className={`text-[12px] font-semibold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {i + 1}. {node.title}
                  </p>
                  {node.content && (
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {node.content}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* 연결 요약 */}
            {result.edges.length > 0 && (
              <p className={`text-[11px] mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                연결: {result.edges.map((e) => `${e.sourceIndex + 1}→${e.targetIndex + 1}`).join(', ')}
              </p>
            )}

            {/* 적용 버튼 */}
            <button
              onClick={handleApply}
              className="w-full py-2.5 text-[13px] font-semibold rounded-xl text-white bg-[#001AFF] hover:bg-[#0015D4] transition-colors shadow-sm shadow-[#001AFF]/20 active:scale-[0.98]"
            >
              캔버스에 적용
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
