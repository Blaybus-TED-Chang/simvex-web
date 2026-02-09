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
  isDarkMode: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (!editing) {
    return (
      <span
        className={`text-sm tabular-nums cursor-text rounded px-1 -mx-1 hover:bg-blue-500/10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
        onClick={() => {
          setDraft(String(Math.round(value)));
          setEditing(true);
        }}
        title="클릭하여 직접 입력"
      >
        {Math.round(value)}%
      </span>
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
        className={`w-12 text-sm text-right rounded px-1 outline-none border ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-200'
            : 'bg-white border-gray-300 text-gray-700'
        }`}
      />
      <span className={`text-sm ml-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
    </span>
  );
}

export function ExplodeSlider() {
  const { explodeValue, setExplodeValue, globalOpacity, setGlobalOpacity, isDarkMode } = useViewerStore();

  // 투명도: 0% = 불투명(opacity 1), 100% = 완전투명(opacity 0)
  const transparencyPercent = Math.round((1 - globalOpacity) * 100);

  return (
    <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>분해/조립</span>
        <EditablePercent
          value={Math.round(explodeValue * 100)}
          onChange={(v) => setExplodeValue(v / 100)}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>조립</span>
        <input
          type="range"
          min="0"
          max="100"
          value={explodeValue * 100}
          onChange={(e) => setExplodeValue(Number(e.target.value) / 100)}
          className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer
                     ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110`}
        />
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>분해</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setExplodeValue(0)}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          조립
        </button>
        <button
          onClick={() => setExplodeValue(0.5)}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          50%
        </button>
        <button
          onClick={() => setExplodeValue(1)}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          분해
        </button>
      </div>

      {/* 투명도 슬라이더 — 0%=불투명(기본), 100%=투명 */}
      <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>투명도</span>
          <EditablePercent
            value={transparencyPercent}
            onChange={(v) => setGlobalOpacity(1 - v / 100)}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>불투명</span>
          <input
            type="range"
            min="0"
            max="100"
            value={transparencyPercent}
            onChange={(e) => setGlobalOpacity(1 - Number(e.target.value) / 100)}
            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer
                       ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-purple-500
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:transition-transform
                       [&::-webkit-slider-thumb]:hover:scale-110`}
          />
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>투명</span>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setGlobalOpacity(1)}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            0%
          </button>
          <button
            onClick={() => setGlobalOpacity(0.5)}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            50%
          </button>
          <button
            onClick={() => setGlobalOpacity(0)}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            100%
          </button>
        </div>
      </div>
    </div>
  );
}
