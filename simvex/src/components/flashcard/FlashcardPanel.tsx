'use client';

import { useState, useCallback, useEffect } from 'react';
import { FlashcardViewer, FlashcardData } from './FlashcardViewer';

interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
}

interface FlashcardPanelProps {
  modelId: string;
  modelInfo: {
    name: string;
    nameKo: string;
    theory: string;
    parts: PartInfo[];
  };
  notesContent?: string;
  chatHistory?: string;
  isDarkMode?: boolean;
}

export function FlashcardPanel({ modelId, modelInfo, notesContent, chatHistory, isDarkMode }: FlashcardPanelProps) {
  const [cards, setCards] = useState<FlashcardData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // localStorage 캐시 로드
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`flashcards-${modelId}`);
      if (cached) {
        setCards(JSON.parse(cached));
      }
    } catch { /* ignore */ }
  }, [modelId]);

  const generateCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/flashcard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: modelInfo.name,
          modelNameKo: modelInfo.nameKo,
          modelTheory: modelInfo.theory,
          parts: modelInfo.parts.map((p) => ({
            id: p.id,
            name: p.name,
            nameKo: p.nameKo,
            description: p.description,
          })),
          notesContent,
          chatHistory,
          cardCount: 10,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '플래시카드 생성에 실패했습니다.');
      }

      const data = await res.json();
      const generated: FlashcardData[] = data.cards;
      setCards(generated);

      // localStorage 캐시 저장
      try {
        localStorage.setItem(`flashcards-${modelId}`, JSON.stringify(generated));
      } catch { /* ignore */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelInfo, notesContent, chatHistory]);

  // 아직 카드가 없을 때: 생성 버튼
  if (!cards && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <svg className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          AI 플래시카드
        </p>
        <p className={`text-xs text-center mb-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          노트와 대화 내용을 기반으로<br />암기용 플래시카드를 자동 생성합니다
        </p>
        <button
          onClick={generateCards}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
        >
          플래시카드 생성
        </button>
        {error && (
          <p className="text-xs text-red-400 mt-3">{error}</p>
        )}
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          AI가 플래시카드를 만들고 있습니다...
        </p>
      </div>
    );
  }

  // 카드 표시
  return (
    <div className="p-4">
      <FlashcardViewer cards={cards!} isDarkMode={isDarkMode} />

      {/* 새로 생성 버튼 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={generateCards}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isDarkMode
              ? 'text-purple-400 hover:bg-purple-900/30'
              : 'text-purple-600 hover:bg-purple-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          새로 생성
        </button>
      </div>
    </div>
  );
}
