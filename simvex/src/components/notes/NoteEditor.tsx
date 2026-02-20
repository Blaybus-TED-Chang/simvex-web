'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState, useCallback } from 'react';
import { PartTagExtension } from '@/lib/tiptap/PartTagExtension';
import { NoteToolbar } from './NoteToolbar';
import { jsonContentToText } from '@/lib/export/pdfGenerator';
import type { NoteItem } from '@/types/note';
import type { JSONContent } from '@tiptap/react';

interface NoteEditorProps {
  note: NoteItem;
  isDarkMode: boolean;
  modelId: string;
  modelNameKo?: string;
  selectedPartId: string | null;
  selectedPartName: string | null;
  onUpdate: (id: string, updates: { title?: string; content?: JSONContent }) => void;
  onBack: () => void;
  onUploadImage: (file: File) => Promise<string | null>;
}

export function NoteEditor({
  note,
  isDarkMode,
  modelId,
  modelNameKo,
  selectedPartId,
  selectedPartName,
  onUpdate,
  onBack,
  onUploadImage,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExt,
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
      Underline,
      PartTagExtension,
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[200px] ${
          isDarkMode ? 'prose-invert' : ''
        }`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate(note.id, { content: ed.getJSON() });
    },
  });

  // note 변경 시 에디터 내용 갱신
  useEffect(() => {
    if (editor && note.id) {
      setTitle(note.title);
      // 에디터 내용이 변경되었을 때만 업데이트 (자기 자신이 트리거한 변경은 무시)
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(note.content);
      if (currentJSON !== newJSON && Object.keys(note.content).length > 0) {
        editor.commands.setContent(note.content);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onUpdate(note.id, { title: value });
  };

  const handleImageUpload = async (file: File) => {
    return await onUploadImage(file);
  };

  const handleAIEnhance = useCallback(async (action: 'summarize' | 'expand' | 'organize' | 'simplify') => {
    if (!editor) return;
    const text = jsonContentToText(editor.getJSON());
    if (!text.trim()) return;

    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await fetch('/api/notes/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, action, modelNameKo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI 처리 실패');
      setAiResult(data.result);
    } catch (err) {
      setAiResult(`오류: ${err instanceof Error ? err.message : 'AI 처리 실패'}`);
    } finally {
      setAiLoading(false);
    }
  }, [editor, modelNameKo]);

  const handleInsertAIResult = useCallback(() => {
    if (!editor || !aiResult) return;
    // Tiptap은 insertContent를 HTML로 해석하므로, 줄바꿈과 수평선을 HTML 태그로 변환
    const escapedResult = aiResult
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    editor.chain().focus().insertContent(`<hr><p>${escapedResult}</p>`).run();
    setAiResult(null);
  }, [editor, aiResult]);

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className={`flex items-center gap-2 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={onBack}
          className={`p-1.5 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목을 입력하세요"
          className={`flex-1 text-sm font-medium bg-transparent border-none outline-none ${
            isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          자동 저장
        </span>
      </div>

      {/* 툴바 */}
      <NoteToolbar
        editor={editor}
        isDarkMode={isDarkMode}
        selectedPartId={selectedPartId}
        selectedPartName={selectedPartName}
        modelId={modelId}
        onUploadImage={handleImageUpload}
        onAIEnhance={handleAIEnhance}
        aiLoading={aiLoading}
      />

      {/* 에디터 본문 */}
      <div className={`flex-1 overflow-y-auto p-3 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-900'
      }`}>
        <EditorContent editor={editor} />
      </div>

      {/* AI 결과 프리뷰 */}
      {(aiResult || aiLoading) && (
        <div className={`border-t p-3 ${
          isDarkMode ? 'border-gray-700 bg-purple-900/10' : 'border-gray-200 bg-purple-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium flex items-center gap-1 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-600'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 결과
            </span>
            {aiResult && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleInsertAIResult}
                  className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  노트에 추가
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  닫기
                </button>
              </div>
            )}
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                AI가 노트를 처리하고 있습니다...
              </span>
            </div>
          ) : (
            <div className={`text-sm whitespace-pre-wrap max-h-48 overflow-y-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {aiResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
