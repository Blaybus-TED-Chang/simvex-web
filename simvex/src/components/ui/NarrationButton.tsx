'use client';

import { useState, useCallback, useRef } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { PartInfoData } from '@/components/viewer/PartInfo';

interface NarrationButtonProps {
  part: PartInfoData;
  modelInfo?: {
    name: string;
    nameKo: string;
    description: string;
    theory: string;
    category: string;
  };
  allParts?: { nameKo: string; description: string }[];
  isDarkMode?: boolean;
}

export function NarrationButton({ part, modelInfo, allParts, isDarkMode }: NarrationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Record<string, string>>({});
  const { speak, stop, isSpeaking } = useTTS();

  const handleClick = useCallback(async () => {
    if (isSpeaking) {
      stop();
      return;
    }

    // 캐시 확인
    if (cacheRef.current[part.id]) {
      speak(cacheRef.current[part.id]);
      return;
    }

    if (!modelInfo) {
      // modelInfo 없으면 기본 TTS로 fallback
      speak(`${part.nameKo}. ${part.description}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: {
            name: part.name,
            nameKo: part.nameKo,
            description: part.description,
            material: part.material,
          },
          modelInfo,
          allParts: allParts || [],
        }),
      });

      if (!res.ok) throw new Error('API 오류');

      const data = await res.json();
      const narration = data.narration || `${part.nameKo}. ${part.description}`;

      // 캐시 저장
      cacheRef.current[part.id] = narration;
      speak(narration);
    } catch {
      // 에러 시 기본 TTS
      speak(`${part.nameKo}. ${part.description}`);
    } finally {
      setIsLoading(false);
    }
  }, [part, modelInfo, allParts, isSpeaking, speak, stop]);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center rounded-md transition-colors shrink-0 w-6 h-6 p-0.5 ${
        isLoading
          ? 'text-amber-500 animate-pulse cursor-wait'
          : isSpeaking
          ? 'text-[#001AFF] bg-blue-50'
          : isDarkMode
          ? 'text-purple-400 hover:text-purple-300 hover:bg-gray-700'
          : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'
      }`}
      title={isLoading ? 'AI 나레이션 생성 중...' : isSpeaking ? 'AI 나레이션 중지' : 'AI 음성 해설'}
    >
      {isLoading ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ) : isSpeaking ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.5 2l5 5M14.5 2l-5 5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          {/* Sparkle + Speaker combined */}
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.54 8.46a5 5 0 010 7.07" />
          <circle cx="19" cy="4" r="1" fill="currentColor" />
          <circle cx="21" cy="7" r="0.5" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
