'use client';

import { useState, useCallback } from 'react';

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  category: '개념' | '부품' | '원리' | '응용';
}

interface FlashcardViewerProps {
  cards: FlashcardData[];
  isDarkMode?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  '개념': { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/40', darkText: 'text-blue-300' },
  '부품': { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/40', darkText: 'text-green-300' },
  '원리': { bg: 'bg-orange-100', text: 'text-orange-700', darkBg: 'bg-orange-900/40', darkText: 'text-orange-300' },
  '응용': { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'bg-purple-900/40', darkText: 'text-purple-300' },
};

export function FlashcardViewer({ cards, isDarkMode }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [displayCards, setDisplayCards] = useState(cards);

  const card = displayCards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(displayCards.length - 1, prev + 1));
  }, [displayCards.length]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...displayCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDisplayCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [displayCards]);

  if (!card) return null;

  const colors = categoryColors[card.category] || categoryColors['개념'];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 카드 */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '200px',
          }}
        >
          {/* 앞면 */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 p-6 flex flex-col justify-between ${
              isDarkMode ? 'bg-gray-800 border-purple-700' : 'bg-white border-purple-200'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium mb-3 ${
                isDarkMode ? `${colors.darkBg} ${colors.darkText}` : `${colors.bg} ${colors.text}`
              }`}>
                {card.category}
              </span>
              <p className={`text-[15px] leading-relaxed font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {card.front}
              </p>
            </div>
            <p className={`text-[11px] text-center mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              클릭하여 답변 확인
            </p>
          </div>

          {/* 뒷면 */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 p-6 flex flex-col justify-between ${
              isDarkMode ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-50 border-purple-300'
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium mb-3 ${
                isDarkMode ? 'bg-purple-800/50 text-purple-300' : 'bg-purple-200 text-purple-700'
              }`}>
                답변
              </span>
              <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                {card.back}
              </p>
            </div>
            <p className={`text-[11px] text-center mt-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>
              클릭하여 질문으로 돌아가기
            </p>
          </div>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-2 rounded-lg transition-colors ${
            currentIndex === 0
              ? isDarkMode ? 'text-gray-600' : 'text-gray-300'
              : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`flex-1 text-center text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {currentIndex + 1} / {displayCards.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === displayCards.length - 1}
          className={`p-2 rounded-lg transition-colors ${
            currentIndex === displayCards.length - 1
              ? isDarkMode ? 'text-gray-600' : 'text-gray-300'
              : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={handleShuffle}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
          title="카드 섞기"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
