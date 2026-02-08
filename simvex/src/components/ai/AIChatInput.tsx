'use client';

import { useState } from 'react';

interface AIChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
}

export function AIChatInput({ onSend, isLoading, isDarkMode, inputValue, setInputValue }: AIChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        onSend(inputValue.trim());
      }
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue.trim());
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="질문을 입력하세요..."
        disabled={isLoading}
        rows={1}
        className={`flex-1 rounded-lg px-3 py-2 text-sm resize-none
                   focus:outline-none focus:border-blue-500 transition-colors
                   disabled:opacity-50
                   ${isDarkMode
                     ? 'bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-500'
                     : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                   }`}
        style={{ maxHeight: '80px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = Math.min(target.scrollHeight, 80) + 'px';
        }}
      />
      <button
        onClick={handleSend}
        disabled={isLoading || !inputValue.trim()}
        className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                 hover:bg-blue-600 transition-colors flex-shrink-0
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
      </button>
    </div>
  );
}
