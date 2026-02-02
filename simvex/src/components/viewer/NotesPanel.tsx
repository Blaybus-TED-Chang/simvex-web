'use client';

import { useState, useRef, useEffect } from 'react';
import { useViewerStore } from '@/lib/store/viewerStore';

type TabType = 'notes' | 'ai';

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
}

export function NotesPanel({ modelInfo, selectedPart }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const { notes, setNotes } = useViewerStore();

  // AI 채팅 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    setMessages((prev) => [...prev, userMessage]);
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
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          modelInfo: modelInfo || undefined,
          selectedPart: selectedPart || undefined,
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

      setMessages((prev) => [...prev, assistantMessage]);
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
    setMessages([]);
    setError(null);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'notes'
              ? 'text-white bg-gray-700/50'
              : 'text-gray-400 hover:text-white'
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
              ? 'text-white bg-gray-700/50'
              : 'text-gray-400 hover:text-white'
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
              className="flex-1 w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3
                       text-sm text-gray-300 placeholder-gray-500 resize-none
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="mt-2 text-xs text-gray-500 text-right">
              자동 저장됨
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* 현재 컨텍스트 표시 */}
            {(modelInfo || selectedPart) && (
              <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-400 mb-1">현재 컨텍스트:</p>
                <div className="text-xs text-gray-400">
                  {modelInfo && <span className="mr-2">모델: {modelInfo.nameKo}</span>}
                  {selectedPart && <span className="text-green-400">| 선택: {selectedPart.nameKo}</span>}
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
                    <p className="text-sm text-gray-400">AI 어시스턴트</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                      현재 모델이나 부품에 대해 질문해보세요!
                    </p>
                    <div className="mt-3 space-y-1">
                      <button
                        onClick={() => setInputValue('이 부품의 역할이 뭐야?')}
                        className="block w-full text-xs text-blue-400 hover:text-blue-300 py-1"
                      >
                        "이 부품의 역할이 뭐야?"
                      </button>
                      <button
                        onClick={() => setInputValue('작동 원리를 설명해줘')}
                        className="block w-full text-xs text-blue-400 hover:text-blue-300 py-1"
                      >
                        "작동 원리를 설명해줘"
                      </button>
                      <button
                        onClick={() => setInputValue('실제로 어디에 사용돼?')}
                        className="block w-full text-xs text-blue-400 hover:text-blue-300 py-1"
                      >
                        "실제로 어디에 사용돼?"
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
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="질문을 입력하세요..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-gray-300 placeholder-gray-500
                           focus:outline-none focus:border-blue-500 transition-colors
                           disabled:opacity-50"
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
                  className="mt-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
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
