'use client';

import { useState, useRef, useEffect } from 'react';
import { PartCustomization } from '@/hooks/usePartCustomizations';

interface PartInfoData {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  color?: string;
}

interface PartInfoProps {
  part: PartInfoData | null;
  isLoggedIn?: boolean;
  customization?: PartCustomization;
  onCustomize?: (partId: string, updates: PartCustomization) => void;
  onResetCustomize?: (partId: string) => void;
}

export function PartInfo({ part, isLoggedIn, customization, onCustomize, onResetCustomize }: PartInfoProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const hasCustomization = customization && (customization.color || customization.nameKo);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (!showColorPicker) return;
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColorPicker]);

  useEffect(() => {
    setIsEditingName(false);
    setShowColorPicker(false);
  }, [part?.id]);

  if (!part) {
    return (
      <div className="text-center py-8">
        <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p className="text-[13px] text-gray-400">부품을 클릭하여 정보를 확인하세요</p>
      </div>
    );
  }

  const displayNameKo = customization?.nameKo ?? part.nameKo;
  const displayColor = customization?.color ?? part.color;

  const handleStartEditName = () => {
    setEditName(displayNameKo);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    const trimmed = editName.trim();
    if (trimmed && trimmed !== part.nameKo && onCustomize) {
      onCustomize(part.id, { nameKo: trimmed });
    } else if (trimmed === part.nameKo && customization?.nameKo && onCustomize) {
      onCustomize(part.id, { nameKo: undefined });
    }
  };

  const handleColorChange = (color: string) => {
    if (onCustomize) {
      onCustomize(part.id, { color });
    }
  };

  const presetColors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#FFFFFF',
  ];

  return (
    <div className="relative">
      {/* 이름 + 색상 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="text-[18px] font-bold w-full px-2 py-0.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[#001AFF] focus:ring-1 focus:ring-blue-200 transition-all"
              />
            ) : (
              <>
                <h4 className="text-[18px] font-bold text-gray-900 truncate">{displayNameKo}</h4>
                {isLoggedIn && onCustomize && (
                  <button
                    onClick={handleStartEditName}
                    className="p-0.5 rounded text-gray-300 hover:text-[#001AFF] transition-colors shrink-0"
                    title="이름 편집"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
          <p className="text-[13px] text-gray-400 mt-0.5">{part.name}</p>
        </div>

        {/* 색상 스와치 */}
        <div className="relative shrink-0" ref={colorPickerRef}>
          <button
            onClick={() => isLoggedIn && onCustomize && setShowColorPicker(!showColorPicker)}
            className={`w-8 h-8 rounded-lg border-2 border-gray-200 transition-all ${isLoggedIn ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            style={{ backgroundColor: displayColor || '#888888' }}
            title={isLoggedIn ? '색상 변경' : ''}
          />

          {showColorPicker && (
            <div className="absolute right-0 top-full mt-2 p-3 rounded-xl shadow-xl border border-gray-200 bg-white z-50" style={{ animation: 'scaleIn 0.2s ease both' }}>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      handleColorChange(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                      displayColor === c ? 'border-[#001AFF] ring-1 ring-blue-200' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={displayColor || '#888888'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-7 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* 재질 */}
      {part.material && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[12px] text-gray-400">재질</span>
          <span className="text-[13px] font-medium text-gray-700">{part.material}</span>
        </div>
      )}

      {/* 설명 */}
      <p className={`text-[13px] text-gray-500 leading-relaxed mt-2 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {part.description}
      </p>

      {/* 원본 복원 */}
      {isLoggedIn && hasCustomization && onResetCustomize && isExpanded && (
        <button
          onClick={() => onResetCustomize(part.id)}
          className="text-[12px] text-gray-400 hover:text-red-500 mt-2 transition-colors"
        >
          원본으로 복원
        </button>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-center pt-3 mt-2 border-t border-gray-100"
      >
        <svg
          className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
