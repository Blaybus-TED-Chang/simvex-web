'use client';

import { useState, useRef, useEffect } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';
import { useSupabaseNotes } from '@/hooks/useSupabaseNotes';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import type { User } from '@supabase/supabase-js';

type TabType = 'notes' | 'ai';

const AI_MODELS = [
  // GPT-5 계열
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', group: 'GPT-5' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', group: 'GPT-5' },
  { id: 'gpt-5', name: 'GPT-5', group: 'GPT-5' },
  // GPT-4.1 계열
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', group: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', group: 'GPT-4.1' },
  { id: 'gpt-4.1', name: 'GPT-4.1', group: 'GPT-4.1' },
  // GPT-4o 계열
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', group: 'GPT-4o' },
  { id: 'gpt-4o', name: 'GPT-4o', group: 'GPT-4o' },
] as const;

type AIModelType = typeof AI_MODELS[number]['id'];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

interface NotesPanelProps {
  modelInfo?: ModelInfo | null;
  selectedPart?: PartInfo | null;
  user?: User | null;
  modelId?: string;
}

export function NotesPanel({ modelInfo, selectedPart, user, modelId }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const localStore = useViewerStore();
  const { isDarkMode } = localStore;

  // Supabase 훅 (user가 있을 때만 활성)
  const supabaseNotes = useSupabaseNotes(user ?? null, modelId ?? '');
  const supabaseChat = useSupabaseChat(user ?? null, modelId ?? '');

  // 로그인 시 Supabase, 비로그인 시 localStorage
  const notes = user ? supabaseNotes.notes : localStore.notes;
  const setNotes = user ? supabaseNotes.saveNotes : localStore.setNotes;

  // AI 채팅 상태
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messages = user ? supabaseChat.messages : localMessages;
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI 모델 선택 (localStorage에서 불러오기)
  const [selectedAIModel, setSelectedAIModel] = useState<AIModelType>('gpt-5-nano');

  useEffect(() => {
    const saved = localStorage.getItem('ai-model-preference');
    if (saved && AI_MODELS.some((m) => m.id === saved)) {
      setSelectedAIModel(saved as AIModelType);
    }
  }, []);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as AIModelType;
    setSelectedAIModel(model);
    localStorage.setItem('ai-model-preference', model);
  };

  // 메시지 목록 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI에게 메시지 전송
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
    };

    const updatedWithUser = [...messages, userMessage];

    // 유저 메시지 먼저 UI에 반영
    if (user) {
      supabaseChat.saveMessages(updatedWithUser);
    } else {
      setLocalMessages(updatedWithUser);
    }

    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          modelInfo: modelInfo || undefined,
          selectedPart: selectedPart || undefined,
          aiModel: selectedAIModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '응답을 가져오는데 실패했습니다.');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
      };

      const updatedWithAssistant = [...updatedWithUser, assistantMessage];
      if (user) {
        supabaseChat.saveMessages(updatedWithAssistant);
      } else {
        setLocalMessages(updatedWithAssistant);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 대화 초기화
  const clearChat = () => {
    if (user) {
      supabaseChat.clearMessages();
    } else {
      setLocalMessages([]);
    }
    setError(null);
  };

  return (
    <div className={`backdrop-blur rounded-lg overflow-hidden flex flex-col h-full ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      {/* 탭 헤더 */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'notes'
              ? isDarkMode ? 'text-white bg-gray-700/50' : 'text-gray-900 bg-gray-100'
              : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            노트
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'ai'
              ? isDarkMode ? 'text-white bg-gray-700/50' : 'text-gray-900 bg-gray-100'
              : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            AI 어시스턴트
          </span>
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {activeTab === 'notes' ? (
          <div className="h-full flex flex-col">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="학습 내용을 메모하세요..."
              className={`flex-1 w-full rounded-lg p-3 text-sm resize-none
                       focus:outline-none focus:border-blue-500 transition-colors
                       ${isDarkMode
                         ? 'bg-gray-900/50 border border-gray-700 text-gray-300 placeholder-gray-500'
                         : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                       }`}
            />
            <p className={`mt-2 text-xs text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {user ? '클라우드에 자동 저장됨' : '자동 저장됨 (로컬)'}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* 현재 컨텍스트 표시 */}
            {(modelInfo || selectedPart) && (
              <div className={`mb-3 p-2 rounded-lg ${
                isDarkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>현재 컨텍스트:</p>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {modelInfo && <span className="mr-2">모델: {modelInfo.nameKo}</span>}
                  {selectedPart && <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>| 선택: {selectedPart.nameKo}</span>}
                </div>
              </div>
            )}

            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI 어시스턴트</p>
                    <p className={`text-xs mt-1 max-w-[200px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      현재 모델이나 부품에 대해 질문해보세요!
                    </p>
                    <div className="mt-3 space-y-1">
                      <button
                        onClick={() => setInputValue('이 부품의 역할이 뭐야?')}
                        className={`block w-full text-xs py-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                      >
                        &quot;이 부품의 역할이 뭐야?&quot;
                      </button>
                      <button
                        onClick={() => setInputValue('작동 원리를 설명해줘')}
                        className={`block w-full text-xs py-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                      >
                        &quot;작동 원리를 설명해줘&quot;
                      </button>
                      <button
                        onClick={() => setInputValue('실제로 어디에 사용돼?')}
                        className={`block w-full text-xs py-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                      >
                        &quot;실제로 어디에 사용돼?&quot;
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`rounded-lg px-3 py-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* 입력창 */}
            <div className="mt-auto">
              {/* 모델 선택 드롭다운 */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>모델:</span>
                <select
                  value={selectedAIModel}
                  onChange={handleModelChange}
                  className={`flex-1 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 border border-gray-600'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <optgroup label="GPT-5 (추론 모델)">
                    <option value="gpt-5-nano">GPT-5 Nano (가장 빠름)</option>
                    <option value="gpt-5-mini">GPT-5 Mini</option>
                    <option value="gpt-5">GPT-5 (고품질)</option>
                  </optgroup>
                  <optgroup label="GPT-4.1">
                    <option value="gpt-4.1-nano">GPT-4.1 Nano (가장 빠름)</option>
                    <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                    <option value="gpt-4.1">GPT-4.1</option>
                  </optgroup>
                  <optgroup label="GPT-4o">
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="질문을 입력하세요..."
                  disabled={isLoading}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-blue-500 transition-colors
                           disabled:opacity-50
                           ${isDarkMode
                             ? 'bg-gray-900/50 border border-gray-700 text-gray-300 placeholder-gray-500'
                             : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                           }`}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                           hover:bg-blue-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '...' : '전송'}
                </button>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className={`mt-2 text-xs transition-colors ${isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  대화 초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
