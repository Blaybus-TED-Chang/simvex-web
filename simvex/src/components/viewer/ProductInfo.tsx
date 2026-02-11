'use client';

import { useState, useRef, useEffect } from 'react';

interface ModelInfo {
  nameKo: string;
  name: string;
  category: string;
  description: string;
  theory: string;
  parts: { id: string }[];
}

interface ProductInfoProps {
  model: ModelInfo | null;
  customName?: string;
  onRename?: (name: string) => void;
  isDarkMode?: boolean;
}

export function ProductInfo({ model, customName, onRename, isDarkMode }: ProductInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!model) return null;

  const displayName = customName || model.nameKo;

  const handleStartEdit = () => {
    if (!onRename) return;
    setEditValue(displayName);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== model.nameKo && onRename) {
      onRename(trimmed);
    } else if (trimmed === model.nameKo && customName && onRename) {
      onRename('');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className={`text-[18px] font-bold w-full px-2 py-0.5 rounded-lg border outline-none focus:border-[#001AFF] focus:ring-1 focus:ring-blue-200 transition-all ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'}`}
          />
        ) : (
          <>
            <h4 className={`text-[18px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</h4>
            {onRename && (
              <button
                onClick={handleStartEdit}
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
      <p className="text-[13px] text-gray-400 mt-0.5">{model.name}</p>

      <div className="flex items-center gap-2 mt-3">
        <span className={`px-2.5 py-1 text-[12px] font-semibold rounded-md ${isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
          {model.category}
        </span>
        <span className="text-[13px] text-gray-500 font-medium">
          부품 <span className="text-[#001AFF] font-bold">{model.parts.length}개</span>
        </span>
      </div>

      <p className={`text-[13px] leading-relaxed mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${!isExpanded ? 'line-clamp-3' : ''}`}>
        {model.description}
      </p>

      {model.theory && (
        <p className={`text-[13px] leading-relaxed mt-2 whitespace-pre-line ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${!isExpanded ? 'hidden' : ''}`}>
          {model.theory}
        </p>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex justify-center pt-3 mt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
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
