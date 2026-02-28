'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { AIModelSelector, type AIModelType } from './AIModelSelector';
import { AIChatMessages } from './AIChatMessages';
import { AIChatInput } from './AIChatInput';
import type { ChatMessage } from '@/types/note';

interface ModelInfo {
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
}

interface PartInfo {
  name: string;
  nameKo: string;
  description: string;
  material?: string;
}

interface AIChatPanelProps {
  modelId: string;
  modelInfo: ModelInfo | null;
  selectedPart: PartInfo | null;
  user: User | null;
  isDarkMode: boolean;
  onClose: () => void;
  allParts?: { id: string; name: string; nameKo: string }[];
  onSelectPart?: (partId: string) => void;
}

export function AIChatPanel({
  modelId,
  modelInfo,
  selectedPart,
  user,
  isDarkMode,
  onClose,
  allParts,
  onSelectPart,
}: AIChatPanelProps) {
  const supabaseChat = useSupabaseChat(user ?? null, modelId ?? '');

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messages = user ? supabaseChat.messages : localMessages;

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const [selectedAIModel, setSelectedAIModel] = useState<AIModelType>('gpt-5-nano');

  useEffect(() => {
    const saved = localStorage.getItem('ai-model-preference');
    if (saved) setSelectedAIModel(saved as AIModelType);
  }, []);

  const handleModelChange = useCallback((model: AIModelType) => {
    setSelectedAIModel(model);
    localStorage.setItem('ai-model-preference', model);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    const updatedWithUser = [...messages, userMessage];

    if (user) {
      supabaseChat.saveMessages(updatedWithUser);
    } else {
      setLocalMessages(updatedWithUser);
    }

    setInputValue('');
    setIsLoading(true);
    setStreamingMessage('');
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedWithUser.map((m) => ({ role: m.role, content: m.content })),
          modelInfo: modelInfo || undefined,
          selectedPart: selectedPart || undefined,
          aiModel: selectedAIModel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '응답을 가져오는데 실패했습니다.');
      }

      // 스트리밍 읽기
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingMessage(accumulated);
      }

      // 스트리밍 완료 → 정식 메시지로 확정
      setStreamingMessage(undefined);
      const partRefs = allParts && allParts.length > 0 ? findPartRefs(accumulated, allParts) : undefined;
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: accumulated,
        ...(partRefs && partRefs.length > 0 ? { partRefs } : {}),
      };
      const updatedWithAssistant = [...updatedWithUser, assistantMessage];
      if (user) {
        supabaseChat.saveMessages(updatedWithAssistant);
      } else {
        setLocalMessages(updatedWithAssistant);
      }
    } catch (err) {
      setStreamingMessage(undefined);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, user, supabaseChat, modelInfo, selectedPart, selectedAIModel, allParts]);

  const clearChat = useCallback(() => {
    if (user) {
      supabaseChat.clearMessages();
    } else {
      setLocalMessages([]);
    }
    setError(null);
  }, [user, supabaseChat]);

  const handleSuggestionClick = useCallback((text: string) => {
    setInputValue(text);
  }, []);



  return (
    <div className={`h-full flex flex-col ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between px-4 py-2 border-b flex-shrink-0 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AI 어시스턴트
          </span>
          <AIModelSelector
            value={selectedAIModel}
            onChange={handleModelChange}
            isDarkMode={isDarkMode}
          />
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
            >
              초기화
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 컨텍스트 표시 */}
      {(modelInfo || selectedPart) && (
        <div className={`px-4 py-1.5 border-b flex-shrink-0 ${
          isDarkMode ? 'bg-blue-500/5 border-gray-700' : 'bg-blue-50 border-gray-200'
        }`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {modelInfo && <span className="mr-2">모델: {modelInfo.nameKo}</span>}
            {selectedPart && <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>| 선택: {selectedPart.nameKo}</span>}
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 min-h-0">
        <AIChatMessages
          messages={messages}
          isLoading={isLoading}
          streamingMessage={streamingMessage}
          isDarkMode={isDarkMode}
          onSuggestionClick={handleSuggestionClick}
          allParts={allParts}
          onPartClick={onSelectPart}
        />
      </div>

      {/* 에러 */}
      {error && (
        <div className="px-4 py-1.5 flex-shrink-0">
          <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* 입력 */}
      <div className={`px-4 py-3 border-t flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <AIChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
}

function findPartRefs(text: string, parts: { id: string; name: string; nameKo: string }[]): string[] {
  const matched: string[] = [];
  for (const p of parts) {
    if (text.includes(p.nameKo) || text.toLowerCase().includes(p.name.toLowerCase())) {
      matched.push(p.id);
    }
    if (matched.length >= 5) break;
  }
  return matched;
}
