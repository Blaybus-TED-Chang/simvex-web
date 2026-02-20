'use client';

import type { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';

interface NoteToolbarProps {
  editor: Editor;
  isDarkMode: boolean;
  selectedPartId: string | null;
  selectedPartName: string | null;
  modelId: string;
  onUploadImage: (file: File) => Promise<string | null>;
  onAIEnhance?: (action: 'summarize' | 'expand' | 'organize' | 'simplify') => void;
  aiLoading?: boolean;
}

export function NoteToolbar({
  editor,
  isDarkMode,
  selectedPartId,
  selectedPartName,
  modelId,
  onUploadImage,
  onAIEnhance,
  aiLoading = false,
}: NoteToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-blue-500 text-white'
        : isDarkMode
          ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
    }`;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertPartTag = () => {
    if (!selectedPartId || !selectedPartName) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'partTag',
        attrs: { partId: selectedPartId, partName: selectedPartName, modelId },
      })
      .run();
  };

  return (
    <div className={`flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="굵게"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="기울임"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
        </svg>
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title="밑줄"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
        </svg>
      </button>

      <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

      {/* H2 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="제목 2"
      >
        <span className="text-xs font-bold">H2</span>
      </button>

      {/* H3 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        title="제목 3"
      >
        <span className="text-xs font-bold">H3</span>
      </button>

      <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

      {/* Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="목록"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
        </svg>
      </button>

      {/* Ordered List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="번호 목록"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
        </svg>
      </button>

      <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

      {/* Image */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={btnClass(false)}
        title="이미지 삽입"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Part Tag */}
      <button
        type="button"
        onClick={insertPartTag}
        disabled={!selectedPartId}
        className={`p-1.5 rounded transition-colors ${
          selectedPartId
            ? 'text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30'
            : isDarkMode
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 cursor-not-allowed'
        }`}
        title={selectedPartId ? `부품 태그 삽입: ${selectedPartName}` : '부품을 선택하세요'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </button>

      {/* AI 강화 */}
      {onAIEnhance && (
        <>
          <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAIMenu(!showAIMenu)}
              disabled={aiLoading}
              className={`p-1.5 rounded transition-colors ${
                aiLoading
                  ? isDarkMode ? 'text-gray-600 cursor-wait' : 'text-gray-300 cursor-wait'
                  : isDarkMode
                    ? 'text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
                    : 'text-purple-600 hover:bg-purple-50 border border-purple-200'
              }`}
              title="AI 노트 강화"
            >
              {aiLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </button>
            {showAIMenu && !aiLoading && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAIMenu(false)} />
                <div className={`absolute right-0 top-full mt-1 z-20 w-36 rounded-lg shadow-lg border py-1 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  {([
                    { action: 'summarize' as const, label: '요약', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { action: 'expand' as const, label: '확장', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' },
                    { action: 'organize' as const, label: '정리', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                    { action: 'simplify' as const, label: '단순화', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  ]).map(({ action, label, icon }) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setShowAIMenu(false);
                        onAIEnhance(action);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
