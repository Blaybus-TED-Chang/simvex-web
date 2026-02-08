'use client';

import { useState, useRef, useEffect } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';
import { PartCustomization } from '@/hooks/usePartCustomizations';

// 공통 부품 정보 인터페이스
interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  color?: string;
}

interface PartInfoProps {
  part: PartInfo | null;
  isLoggedIn?: boolean;
  customization?: PartCustomization;
  onCustomize?: (partId: string, updates: PartCustomization) => void;
  onResetCustomize?: (partId: string) => void;
}

export function PartInfo({ part, isLoggedIn, customization, onCustomize, onResetCustomize }: PartInfoProps) {
  const { isDarkMode } = useViewerStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const hasCustomization = customization && (customization.color || customization.nameKo);

  // 이름 편집 시작 시 input에 포커스
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // 색상 피커 외부 클릭 시 닫기
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

  // 부품 변경 시 편집 상태 초기화
  useEffect(() => {
    setIsEditingName(false);
    setShowColorPicker(false);
  }, [part?.id]);

  if (!part) {
    return (
      <div className={`backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>부품 정보</h3>
        </div>

        <div className="text-center py-6">
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            부품을 클릭하여 정보를 확인하세요
          </p>
        </div>
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
      // 원본과 같으면 커스텀 이름 제거
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
    <div className={`relative z-10 backdrop-blur rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>선택된 부품</h3>
        </div>

        {/* 원본 복원 버튼 */}
        {isLoggedIn && hasCustomization && onResetCustomize && (
          <button
            onClick={() => onResetCustomize(part.id)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            원본 복원
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* 한글 이름 (편집 가능) */}
        <div>
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
                className={`text-lg font-bold w-full px-1 py-0.5 rounded border outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              />
            ) : (
              <>
                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {displayNameKo}
                </h4>
                {isLoggedIn && onCustomize && (
                  <button
                    onClick={handleStartEditName}
                    className={`p-0.5 rounded transition-colors ${
                      isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
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
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{part.name}</p>
        </div>

        {part.material && (
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>재질:</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{part.material}</span>
          </div>
        )}

        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {part.description}
        </p>

        {/* 색상 (편집 가능) */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>색상:</span>
            <div
              className={`w-4 h-4 rounded border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
              style={{ backgroundColor: displayColor || '#888888' }}
            />
            {isLoggedIn && onCustomize && (
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-0.5 rounded transition-colors ${
                  isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="색상 변경"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
            )}
          </div>

          {/* 색상 피커 */}
          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className={`absolute left-0 mt-2 p-3 rounded-lg shadow-lg border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      handleColorChange(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-7 h-7 rounded border-2 transition-transform hover:scale-110 ${
                      displayColor === c ? 'border-blue-500 ring-1 ring-blue-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
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
    </div>
  );
}
