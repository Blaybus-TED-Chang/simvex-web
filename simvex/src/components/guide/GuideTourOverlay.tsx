'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGuideTourStore } from '@/lib/store/guideTourStore';

interface GuideTourOverlayProps {
  isDarkMode: boolean;
  onSelectPart: (partId: string) => void;
}

export function GuideTourOverlay({ isDarkMode, onSelectPart }: GuideTourOverlayProps) {
  const {
    activeTour,
    currentStep,
    isAutoPlaying,
    autoPlaySpeed,
    nextStep,
    prevStep,
    goToStep,
    toggleAutoPlay,
    setAutoPlaySpeed,
    stopTour,
  } = useGuideTourStore();

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const onSelectPartRef = useRef(onSelectPart);
  onSelectPartRef.current = onSelectPart;

  // 단계 변경 시 부품 선택
  useEffect(() => {
    if (!activeTour) return;
    const step = activeTour.steps[currentStep];
    if (step) {
      onSelectPartRef.current(step.partId);
    }
  }, [activeTour, currentStep]);

  // 자동 재생
  useEffect(() => {
    if (!isAutoPlaying || !activeTour) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      const state = useGuideTourStore.getState();
      if (!state.activeTour) return;
      if (state.currentStep >= state.activeTour.steps.length - 1) {
        useGuideTourStore.getState().toggleAutoPlay();
        return;
      }
      useGuideTourStore.getState().nextStep();
    }, autoPlaySpeed * 1000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isAutoPlaying, autoPlaySpeed, activeTour]);

  // 키보드 단축키
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeTour) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextStep();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevStep();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleAutoPlay();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopTour();
    }
  }, [activeTour, nextStep, prevStep, toggleAutoPlay, stopTour]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!activeTour) return null;

  const step = activeTour.steps[currentStep];
  if (!step) return null;

  const totalSteps = activeTour.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-[560px]">
      <div
        className={`rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
          isDarkMode
            ? 'bg-gray-900/90 border-gray-700/50'
            : 'bg-white/90 border-gray-200/50'
        }`}
      >
        {/* 진행바 */}
        <div className={`h-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 헤더 */}
        <div className="px-5 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {currentStep + 1} / {totalSteps}
            </span>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {step.partNameKo}
            </h3>
          </div>
          <button
            onClick={stopTour}
            className={`p-1 rounded-md transition-colors ${
              isDarkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
            }`}
            title="투어 종료 (Esc)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 설명 */}
        <div className="px-5 py-2">
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {step.explanation}
          </p>
        </div>

        {/* 스텝 닷 */}
        <div className="px-5 py-2 flex justify-center gap-1.5">
          {activeTour.steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToStep(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentStep
                  ? 'w-5 h-2 bg-blue-500'
                  : idx < currentStep
                  ? `w-2 h-2 ${isDarkMode ? 'bg-blue-400/40' : 'bg-blue-300'}`
                  : `w-2 h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`
              }`}
              title={`${idx + 1}단계: ${activeTour.steps[idx].partNameKo}`}
            />
          ))}
        </div>

        {/* 컨트롤 */}
        <div className={`px-5 py-3 flex items-center justify-between border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-100'
        }`}>
          {/* 이전 */}
          <button
            onClick={prevStep}
            disabled={currentStep <= 0}
            className={`p-2 rounded-lg transition-colors ${
              currentStep <= 0
                ? isDarkMode ? 'text-gray-700' : 'text-gray-300'
                : isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="이전 (←)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 자동 재생 + 속도 */}
          <div className="flex items-center gap-2">
            {/* 속도 조절 */}
            <select
              value={autoPlaySpeed}
              onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
              className={`text-xs px-1.5 py-1 rounded border outline-none ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <option value={3}>3s</option>
              <option value={5}>5s</option>
              <option value={8}>8s</option>
              <option value={10}>10s</option>
            </select>

            {/* 재생/일시정지 */}
            <button
              onClick={toggleAutoPlay}
              className={`p-2 rounded-lg transition-colors ${
                isAutoPlaying
                  ? isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                  : isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={isAutoPlaying ? '일시정지 (Space)' : '자동 재생 (Space)'}
            >
              {isAutoPlaying ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              )}
            </button>
          </div>

          {/* 다음 */}
          <button
            onClick={nextStep}
            disabled={currentStep >= totalSteps - 1}
            className={`p-2 rounded-lg transition-colors ${
              currentStep >= totalSteps - 1
                ? isDarkMode ? 'text-gray-700' : 'text-gray-300'
                : isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="다음 (→)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
