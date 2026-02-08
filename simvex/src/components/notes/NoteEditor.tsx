'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState } from 'react';
import { PartTagExtension } from '@/lib/tiptap/PartTagExtension';
import { NoteToolbar } from './NoteToolbar';
import type { NoteItem } from '@/types/note';
import type { JSONContent } from '@tiptap/react';

interface NoteEditorProps {
  note: NoteItem;
  isDarkMode: boolean;
  modelId: string;
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
  selectedPartId,
  selectedPartName,
  onUpdate,
  onBack,
  onUploadImage,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);

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
      />

      {/* 에디터 본문 */}
      <div className={`flex-1 overflow-y-auto p-3 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-900'
      }`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
