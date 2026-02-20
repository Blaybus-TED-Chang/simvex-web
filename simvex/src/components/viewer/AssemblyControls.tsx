'use client';

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
}: AssemblyControlsProps) {
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
          {/* 진행 바 */}
          <div className="flex gap-0.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < currentStep
                    ? 'bg-[#001AFF]'
                    : i === currentStep
                    ? 'bg-blue-300'
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
              className="p-3 rounded-full bg-[#001AFF] text-white hover:bg-blue-700 transition-colors shadow-md"
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
