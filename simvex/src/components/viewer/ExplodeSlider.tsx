'use client';

import { useState, useRef, useEffect } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';

/** 클릭하면 숫자 입력 필드로 전환되는 퍼센트 표시 */
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

export function ExplodeSlider() {
  const { explodeValue, setExplodeValue, globalOpacity, setGlobalOpacity, isDarkMode, xRayMode, setXRayMode, autoFocusEnabled, setAutoFocusEnabled } = useViewerStore();

  const transparencyPercent = Math.round((1 - globalOpacity) * 100);

  return (
    <div className="space-y-5">
      {/* 조립 / 분해 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[14px] font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>조립 / 분해</span>
          <EditablePercent
            value={Math.round(explodeValue * 100)}
            onChange={(v) => setExplodeValue(v / 100)}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[12px] shrink-0 w-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>조립</span>
          <input
            type="range"
            min="0"
            max="100"
            value={explodeValue * 100}
            onChange={(e) => setExplodeValue(Number(e.target.value) / 100)}
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
          <span className={`text-[12px] shrink-0 w-10 text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>분해</span>
        </div>
        <p className={`text-[12px] mt-1 ml-[52px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{Math.round(explodeValue * 100)}%</p>
      </div>

      {/* 투명도 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[14px] font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>투명도</span>
          <EditablePercent
            value={transparencyPercent}
            onChange={(v) => setGlobalOpacity(1 - v / 100)}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[12px] shrink-0 w-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>불투명</span>
          <input
            type="range"
            min="0"
            max="100"
            value={transparencyPercent}
            onChange={(e) => setGlobalOpacity(1 - Number(e.target.value) / 100)}
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
          <span className={`text-[12px] shrink-0 w-10 text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>투명</span>
        </div>
        <p className={`text-[12px] mt-1 ml-[52px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{transparencyPercent}%</p>
      </div>

      {/* X-Ray 모드 */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-[14px] font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>X-Ray</span>
          <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            선택한 부품만 표시
          </p>
        </div>
        <button
          onClick={() => setXRayMode(!xRayMode)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            xRayMode
              ? 'bg-[#001AFF]'
              : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
          }`}
          title={xRayMode ? 'X-Ray 끄기' : 'X-Ray 켜기'}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              xRayMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 자동 포커스 */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-[14px] font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>자동 포커스</span>
          <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            부품 클릭 시 카메라 이동
          </p>
        </div>
        <button
          onClick={() => setAutoFocusEnabled(!autoFocusEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            autoFocusEnabled
              ? 'bg-[#001AFF]'
              : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
          }`}
          title={autoFocusEnabled ? '자동 포커스 끄기' : '자동 포커스 켜기'}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              autoFocusEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
