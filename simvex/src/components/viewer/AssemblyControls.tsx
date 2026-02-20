'use client';

import { useState } from 'react';
import { CombinedPartConfig } from './CombinedGLBPart';

interface AssemblyControlsProps {
  isActive: boolean;
  onToggle: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
  currentPart: CombinedPartConfig | null;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isDarkMode?: boolean;
  onAIRecommend?: () => void;
  aiRecommendLoading?: boolean;
  isAIOrder?: boolean;
  onResetOrder?: () => void;
  currentStepReason?: string;
  aiStrategy?: string;
}

export function AssemblyControls({
  isActive,
  onToggle,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  currentStep,
  totalSteps,
  currentPart,
  speed,
  onSpeedChange,
  isDarkMode,
  onAIRecommend,
  aiRecommendLoading,
  isAIOrder,
  onResetOrder,
  currentStepReason,
  aiStrategy,
}: AssemblyControlsProps) {
  const [strategyExpanded, setStrategyExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* 조립 애니메이션 토글 */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-[14px] font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            조립 애니메이션
          </span>
          <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            부품을 순서대로 조립
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isActive
              ? 'bg-[#001AFF]'
              : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 조립 모드 활성화 시 컨트롤 */}
      {isActive && (
        <div className="space-y-3">
          {/* AI 순서 추천 / 원래 순서 버튼 */}
          {onAIRecommend && (
            <div className="flex gap-2">
              {!isAIOrder ? (
                <button
                  onClick={onAIRecommend}
                  disabled={aiRecommendLoading}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                    aiRecommendLoading
                      ? isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-400'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-sm'
                  }`}
                >
                  {aiRecommendLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      AI 순서 추천
                    </>
                  )}
                </button>
              ) : (
                <>
                  <span className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium ${
                    isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    AI 순서
                  </span>
                  <button
                    onClick={onResetOrder}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    원래 순서
                  </button>
                </>
              )}
            </div>
          )}

          {/* AI 전략 요약 (접을 수 있는 카드) */}
          {isAIOrder && aiStrategy && (
            <div className={`rounded-lg border ${isDarkMode ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50 border-purple-100'}`}>
              <button
                onClick={() => setStrategyExpanded(!strategyExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  조립 전략
                </span>
                <svg className={`w-3 h-3 transition-transform ${strategyExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {strategyExpanded && (
                <p className={`px-3 pb-2 text-[11px] leading-relaxed ${isDarkMode ? 'text-purple-300/80' : 'text-purple-700/80'}`}>
                  {aiStrategy}
                </p>
              )}
            </div>
          )}

          {/* 진행 바 */}
          <div className="flex gap-0.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < currentStep
                    ? isAIOrder ? 'bg-purple-500' : 'bg-[#001AFF]'
                    : i === currentStep
                    ? isAIOrder ? 'bg-purple-300' : 'bg-blue-300'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 현재 단계 정보 */}
          <div className={`text-center py-2`}>
            <p className={`text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              단계 {currentStep + 1} / {totalSteps}
            </p>
            {currentPart && (
              <p className={`text-[12px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentPart.nameKo} ({currentPart.name})
              </p>
            )}
            {/* AI 추천 이유 */}
            {isAIOrder && currentStepReason && (
              <p className={`text-[11px] mt-1.5 px-2 py-1 rounded-md ${
                isDarkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600'
              }`}>
                {currentStepReason}
              </p>
            )}
          </div>

          {/* 재생 컨트롤 */}
          <div className="flex items-center justify-center gap-3">
            {/* 이전 */}
            <button
              onClick={onPrev}
              disabled={currentStep <= 0}
              className={`p-2 rounded-lg transition-colors ${
                currentStep <= 0
                  ? isDarkMode ? 'text-gray-600' : 'text-gray-300'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="이전 단계"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 재생/일시정지 */}
            <button
              onClick={onPlayPause}
              className={`p-3 rounded-full text-white hover:opacity-90 transition-colors shadow-md ${
                isAIOrder ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-[#001AFF] hover:bg-blue-700'
              }`}
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* 다음 */}
            <button
              onClick={onNext}
              disabled={currentStep >= totalSteps - 1}
              className={`p-2 rounded-lg transition-colors ${
                currentStep >= totalSteps - 1
                  ? isDarkMode ? 'text-gray-600' : 'text-gray-300'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="다음 단계"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 속도 조절 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>속도</span>
              <span className={`text-[12px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className={`w-full h-[4px] rounded-full appearance-none cursor-pointer
                         ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-[14px]
                         [&::-webkit-slider-thumb]:h-[14px]
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-[#001AFF]
                         [&::-webkit-slider-thumb]:border-2
                         [&::-webkit-slider-thumb]:border-white
                         [&::-webkit-slider-thumb]:shadow-sm
                         [&::-webkit-slider-thumb]:cursor-pointer`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
