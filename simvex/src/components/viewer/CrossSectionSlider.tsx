'use client';

import { useState, useRef, useEffect } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';
import { CrossSectionAxis } from '@/types/viewer';

function EditablePercent({
  value,
  onChange,
  isDarkMode,
}: {
  value: number;
  onChange: (v: number) => void;
  isDarkMode?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[13px] tabular-nums transition-colors cursor-text ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
        onClick={() => {
          setDraft(String(Math.round(value)));
          setEditing(true);
        }}
        title="클릭하여 직접 입력"
      >
        {Math.round(value)}
        <span className="text-gray-400">%</span>
      </button>
    );
  }

  const apply = (val: string) => {
    const n = Number(val);
    if (!isNaN(n) && val !== '') onChange(Math.max(0, Math.min(100, n)));
  };

  return (
    <span className="inline-flex items-center">
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={100}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          apply(e.target.value);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setEditing(false);
          if (e.key === 'Escape') setEditing(false);
        }}
        className={`w-12 text-[13px] text-right rounded-md px-2 py-1 outline-none border ring-1 ${isDarkMode ? 'border-blue-500 bg-gray-700 text-white ring-blue-500/30' : 'border-blue-400 bg-white text-gray-700 ring-blue-200'}`}
      />
      <span className="text-[13px] ml-0.5 text-gray-400">%</span>
    </span>
  );
}

const axisLabels: Record<CrossSectionAxis, string> = {
  x: '좌/우',
  y: '상/하',
  z: '전/후',
};

export function CrossSectionSlider() {
  const {
    crossSection,
    setCrossSectionEnabled,
    setCrossSectionAxis,
    setCrossSectionOffset,
    setCrossSectionFlipped,
    isDarkMode,
  } = useViewerStore();

  const offsetPercent = Math.round(crossSection.crossSectionOffset * 100);

  return (
    <div className="space-y-4">
      {/* 헤더: 단면도 + 토글 */}
      <div className="flex items-center justify-between">
        <span className={`text-[14px] font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          단면도
        </span>
        <button
          onClick={() => setCrossSectionEnabled(!crossSection.crossSectionEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            crossSection.crossSectionEnabled
              ? 'bg-[#001AFF]'
              : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
          }`}
          title={crossSection.crossSectionEnabled ? '단면도 끄기' : '단면도 켜기'}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              crossSection.crossSectionEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 활성화 시 세부 컨트롤 */}
      {crossSection.crossSectionEnabled && (
        <>
          {/* 축 선택 + 방향 반전 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>절단 축</span>
              <button
                onClick={() => setCrossSectionFlipped(!crossSection.crossSectionFlipped)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-colors ${
                  crossSection.crossSectionFlipped
                    ? 'bg-[#001AFF]/10 border-[#001AFF]/30 text-[#001AFF]'
                    : isDarkMode
                      ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                title="절단 방향 반전"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                반전
              </button>
            </div>
            <div className="flex gap-2">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <button
                  key={axis}
                  onClick={() => setCrossSectionAxis(axis)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                    crossSection.crossSectionAxis === axis
                      ? 'bg-[#001AFF] text-white border-[#001AFF] shadow-sm'
                      : isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">{axis.toUpperCase()}</span>
                  <span className={`block text-[10px] font-normal mt-0.5 ${
                    crossSection.crossSectionAxis === axis
                      ? 'text-white/70'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {axisLabels[axis]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 위치 슬라이더 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>절단 위치</span>
              <EditablePercent
                value={offsetPercent}
                onChange={(v) => setCrossSectionOffset(v / 100)}
                isDarkMode={isDarkMode}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[12px] shrink-0 w-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>0</span>
              <input
                type="range"
                min="0"
                max="100"
                value={offsetPercent}
                onChange={(e) => setCrossSectionOffset(Number(e.target.value) / 100)}
                className={`flex-1 h-[6px] rounded-full appearance-none cursor-pointer
                           ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-[16px]
                           [&::-webkit-slider-thumb]:h-[16px]
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-[#001AFF]
                           [&::-webkit-slider-thumb]:border-2
                           [&::-webkit-slider-thumb]:border-white
                           [&::-webkit-slider-thumb]:shadow-md
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform
                           [&::-webkit-slider-thumb]:hover:scale-110`}
              />
              <span className={`text-[12px] shrink-0 w-8 text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>100</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
