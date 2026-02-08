'use client';

import { useState, useCallback } from 'react';
import type { AnnotationRow, AnnotationInput } from '@/types/annotation';
import { ANNOTATION_COLORS } from '@/types/annotation';
import { useAnnotationStore } from '@/lib/store/annotationStore';

interface AnnotationPanelProps {
  modelId: string;
  annotations: AnnotationRow[];
  isDarkMode: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
  onCreate: (input: AnnotationInput) => Promise<AnnotationRow | null>;
  onUpdate: (id: string, updates: Partial<Pick<AnnotationRow, 'title' | 'content' | 'color'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AnnotationPanel({
  modelId,
  annotations,
  isDarkMode,
  isLoggedIn,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: AnnotationPanelProps) {
  const {
    isPlacingPin,
    setPlacingPin,
    activeAnnotationId,
    setActiveAnnotationId,
    pendingAnnotation,
    setPendingAnnotation,
  } = useAnnotationStore();

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formColor, setFormColor] = useState<string>(ANNOTATION_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 핀 배치 모드 토글
  const handleTogglePlacingPin = useCallback(() => {
    if (isPlacingPin) {
      setPlacingPin(false);
    } else {
      setPendingAnnotation(null);
      setPlacingPin(true);
    }
  }, [isPlacingPin, setPlacingPin, setPendingAnnotation]);

  // 폼 제출 (새 주석 저장)
  const handleSubmit = useCallback(async () => {
    if (!pendingAnnotation) return;

    await onCreate({
      model_id: modelId,
      target_type: 'coordinate',
      position: pendingAnnotation.position,
      title: formTitle,
      content: formContent,
      color: formColor,
    });

    // 폼 리셋
    setFormTitle('');
    setFormContent('');
    setFormColor(ANNOTATION_COLORS[0]);
    setPendingAnnotation(null);
    setPlacingPin(false);
  }, [pendingAnnotation, modelId, formTitle, formContent, formColor, onCreate, setPendingAnnotation, setPlacingPin]);

  // 폼 취소
  const handleCancel = useCallback(() => {
    setPendingAnnotation(null);
    setPlacingPin(false);
    setFormTitle('');
    setFormContent('');
    setFormColor(ANNOTATION_COLORS[0]);
  }, [setPendingAnnotation, setPlacingPin]);

  // 수정 시작
  const handleEditStart = useCallback((ann: AnnotationRow) => {
    setEditingId(ann.id);
    setEditTitle(ann.title);
    setEditContent(ann.content);
  }, []);

  // 수정 저장
  const handleEditSave = useCallback(async () => {
    if (!editingId) return;
    await onUpdate(editingId, { title: editTitle, content: editContent });
    setEditingId(null);
  }, [editingId, editTitle, editContent, onUpdate]);

  // 삭제
  const handleDelete = useCallback(async (id: string) => {
    await onDelete(id);
    if (activeAnnotationId === id) setActiveAnnotationId(null);
    if (editingId === id) setEditingId(null);
  }, [onDelete, activeAnnotationId, setActiveAnnotationId, editingId]);

  const bg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const text = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtext = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';

  if (!isLoggedIn) {
    return (
      <div className={`h-full flex flex-col p-4 ${text}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">3D 주석</h2>
          <button onClick={onClose} className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className={subtext}>로그인 후 주석 기능을 사용할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${text}`}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between p-4 border-b ${border}`}>
        <h2 className="font-semibold text-lg">3D 주석</h2>
        <button onClick={onClose} className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 액션 버튼 */}
      <div className={`p-4 border-b ${border}`}>
        {/* 핀 배치 모드 */}
        <button
          onClick={handleTogglePlacingPin}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            isPlacingPin
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isPlacingPin ? '핀 배치 중... (3D 표면 클릭)' : '좌표에 핀 배치'}
        </button>
      </div>

      {/* 주석 작성 폼 (pending일 때 표시) */}
      {pendingAnnotation && (
        <div className={`p-4 border-b ${border} space-y-3`}>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: formColor }}
            />
            <span className="text-sm font-medium">좌표 주석</span>
          </div>

          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="제목"
            className={`w-full px-3 py-2 rounded-lg text-sm border ${border} ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="내용"
            rows={3}
            className={`w-full px-3 py-2 rounded-lg text-sm border ${border} ${inputBg} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          {/* 색상 선택 */}
          <div className="flex items-center gap-2">
            <span className={`text-xs ${subtext}`}>색상:</span>
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setFormColor(c)}
                className="w-6 h-6 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  border: formColor === c ? '3px solid white' : '2px solid transparent',
                  boxShadow: formColor === c ? '0 0 0 1px ' + c : 'none',
                  transform: formColor === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* 저장/취소 */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formTitle.trim() && !formContent.trim()}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } transition-colors`}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 주석 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {annotations.length === 0 ? (
          <div className={`text-center py-8 ${subtext}`}>
            <svg className="w-8 h-8 mx-auto mb-2 opacity-40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <p className="text-sm">주석이 없습니다</p>
            <p className="text-xs mt-1">핀을 배치하여 주석을 추가하세요</p>
          </div>
        ) : (
          annotations.map((ann) => (
            <div
              key={ann.id}
              onClick={() => setActiveAnnotationId(activeAnnotationId === ann.id ? null : ann.id)}
              className={`rounded-lg p-3 cursor-pointer transition-colors border ${
                activeAnnotationId === ann.id
                  ? `border-blue-500 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`
                  : `${border} ${cardBg} hover:${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'}`
              }`}
            >
              {editingId === ann.id ? (
                // 수정 모드
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-2 py-1 rounded text-sm border ${border} ${inputBg} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className={`w-full px-2 py-1 rounded text-sm border ${border} ${inputBg} resize-none focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleEditSave}
                      className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <>
                  <div className="flex items-start gap-2">
                    <div
                      className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: ann.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {ann.title || '(제목 없음)'}
                      </div>
                      {ann.content && (
                        <div className={`text-xs mt-0.5 ${subtext} line-clamp-2`}>
                          {ann.content}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${subtext}`}>
                        좌표 핀
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 (활성 상태일 때만 표시) */}
                  {activeAnnotationId === ann.id && (
                    <div className="flex gap-1 mt-2 pt-2 border-t border-dashed" style={{ borderColor: isDarkMode ? '#4B5563' : '#D1D5DB' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(ann);
                        }}
                        className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ann.id);
                        }}
                        className="px-2 py-1 text-xs rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
