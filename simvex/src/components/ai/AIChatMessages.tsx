'use client';

import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/note';

interface AIChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingMessage?: string;
  isDarkMode: boolean;
  onSuggestionClick: (text: string) => void;
  allParts?: { id: string; name: string; nameKo: string }[];
  onPartClick?: (partId: string) => void;
}

export function AIChatMessages({ messages, isLoading, streamingMessage, isDarkMode, onSuggestionClick, allParts, onPartClick }: AIChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, streamingMessage]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI 어시스턴트</p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            현재 모델이나 부품에 대해 질문해보세요!
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {['이 부품의 역할이 뭐야?', '작동 원리를 설명해줘', '실제로 어디에 사용돼?'].map((q) => (
              <button
                key={q}
                onClick={() => onSuggestionClick(q)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  isDarkMode
                    ? 'border-gray-700 text-blue-400 hover:bg-gray-800'
                    : 'border-gray-200 text-blue-600 hover:bg-gray-50'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-2 px-3 py-2">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          {message.role === 'assistant' && message.partRefs && message.partRefs.length > 0 && (
            <div className="max-w-[85%] flex flex-wrap gap-1 mt-1">
              {message.partRefs.map((partId) => {
                const part = allParts?.find((p) => p.id === partId);
                if (!part) return null;
                return (
                  <button
                    key={partId}
                    onClick={() => onPartClick?.(partId)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                  >
                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                    {part.nameKo}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      {/* 스트리밍 중: 실시간으로 텍스트 표시 */}
      {streamingMessage !== undefined && streamingMessage !== null && (
        <div className="flex flex-col items-start">
          <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
            isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
          }`}>
            <div className="whitespace-pre-wrap">
              {streamingMessage}
              <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-current align-middle animate-pulse" />
            </div>
          </div>
        </div>
      )}
      {/* 스트리밍 전 대기 중: 점 애니메이션 */}
      {isLoading && !streamingMessage && (
        <div className="flex justify-start">
          <div className={`rounded-lg px-3 py-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
