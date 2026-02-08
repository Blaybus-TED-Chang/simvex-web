'use client';

import type { NoteItem } from '@/types/note';

interface NotesListProps {
  notes: NoteItem[];
  isDarkMode: boolean;
  onCreate: () => void;
  onSelect: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

function getPreviewText(note: NoteItem): string {
  // TipTap JSON에서 텍스트 추출
  const extractText = (node: Record<string, unknown>): string => {
    if (node.type === 'text' && typeof node.text === 'string') return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map((c: Record<string, unknown>) => extractText(c)).join('');
    }
    return '';
  };
  const text = extractText(note.content as Record<string, unknown>);
  return text.slice(0, 80) || '(내용 없음)';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function NotesList({ notes, isDarkMode, onCreate, onSelect, onDelete }: NotesListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          노트
        </h3>
        <button
          onClick={onCreate}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                     bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 노트
        </button>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1">
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                아직 노트가 없습니다
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                &quot;새 노트&quot; 버튼으로 시작하세요
              </p>
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelect(note.id)}
              className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {note.title}
                  </h4>
                  <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getPreviewText(note)}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {formatDate(note.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 노트를 삭제하시겠습니까?')) {
                      onDelete(note.id);
                    }
                  }}
                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
