'use client';

import React, { useRef } from 'react';
import type { WorkflowNode, WorkflowNodeLink, WorkflowAttachmentRow } from '@/types/workflow';

interface WorkflowNodeEditorProps {
  node: WorkflowNode;
  isOwner: boolean;
  isDarkMode: boolean;
  attachments: WorkflowAttachmentRow[];
  uploading: boolean;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onLinksChange: (links: WorkflowNodeLink[]) => void;
  onUploadFile: (file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  getDownloadUrl: (storagePath: string) => string;
}

export function WorkflowNodeEditor({
  node,
  isOwner,
  isDarkMode,
  attachments,
  uploading,
  onClose,
  onTitleChange,
  onContentChange,
  onLinksChange,
  onUploadFile,
  onDeleteAttachment,
  getDownloadUrl,
}: WorkflowNodeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkUrlRef = useRef<HTMLInputElement>(null);
  const linkLabelRef = useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    const url = linkUrlRef.current?.value.trim();
    if (!url) return;
    const label = linkLabelRef.current?.value.trim() || '';
    const newLink: WorkflowNodeLink = { id: crypto.randomUUID(), url, label };
    onLinksChange([...node.links, newLink]);
    if (linkUrlRef.current) linkUrlRef.current.value = '';
    if (linkLabelRef.current) linkLabelRef.current.value = '';
  };

  const handleRemoveLink = (linkId: string) => {
    onLinksChange(node.links.filter((l) => l.id !== linkId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  const handleDownload = async (storagePath: string, fileName: string) => {
    try {
      const url = getDownloadUrl(storagePath);
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // fallback: 새 탭에서 열기
      window.open(getDownloadUrl(storagePath), '_blank');
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] z-50 flex flex-col ${
        isDarkMode
          ? 'bg-gray-900 border-l border-gray-800'
          : 'bg-white border-l border-gray-200'
      }`}
      style={{ boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', animation: 'slideInRight 0.25s ease both' }}
    >
      {/* 상단 장식 바 */}
      <div className="h-1 bg-gradient-to-r from-[#001AFF] via-[#4D6AFF] to-[#001AFF] shrink-0" />

      {/* 헤더 */}
      <div className={`flex items-center justify-between px-5 shrink-0 ${
        isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-100'
      }`} style={{ height: 56 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#001AFF] to-[#4D6AFF] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            노드 상세
          </span>
        </div>
        <button
          onClick={onClose}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* 제목 섹션 */}
        <div>
          <label className={`flex items-center gap-1.5 text-[12px] font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            제목
          </label>
          {isOwner ? (
            <input
              value={node.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 text-white focus:border-[#001AFF] placeholder:text-gray-600'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#001AFF] placeholder:text-gray-300'
              }`}
              placeholder="노드 제목을 입력하세요"
            />
          ) : (
            <p className={`text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{node.title || '제목 없음'}</p>
          )}
        </div>

        {/* 본문 섹션 */}
        <div>
          <label className={`flex items-center gap-1.5 text-[12px] font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            내용
          </label>
          {isOwner ? (
            <textarea
              value={node.content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed outline-none resize-y min-h-[140px] transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 text-white focus:border-[#001AFF] placeholder:text-gray-600'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#001AFF] placeholder:text-gray-300'
              }`}
              placeholder="내용을 입력하세요..."
            />
          ) : (
            <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {node.content || '(내용 없음)'}
            </p>
          )}
        </div>

        {/* 파일 첨부 섹션 */}
        <div>
          <label className={`flex items-center gap-1.5 text-[12px] font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            첨부 파일
            <span className={`text-[11px] font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>({attachments.length})</span>
          </label>
          <div className="space-y-1.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-colors ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200/70'
                }`}>
                  <svg className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <a
                  href={getDownloadUrl(att.storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-[#001AFF] hover:underline font-medium"
                >
                  {att.file_name}
                </a>
                <span className={`shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatFileSize(att.file_size_bytes)}</span>
                <button
                  onClick={() => handleDownload(att.storage_path, att.file_name)}
                  className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-400 hover:text-[#001AFF] hover:bg-blue-50'
                  }`}
                  title="다운로드"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                {isOwner && (
                  <button
                    onClick={() => onDeleteAttachment(att.id)}
                    className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                      isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="mt-2.5">
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-xl border transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-[#001AFF] border-t-transparent rounded-full animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    파일 추가
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 링크 섹션 */}
        <div>
          <label className={`flex items-center gap-1.5 text-[12px] font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            링크
            <span className={`text-[11px] font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>({node.links.length})</span>
          </label>
          <div className="space-y-1.5">
            {node.links.map((link) => (
              <div
                key={link.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-colors ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <svg className={`w-3.5 h-3.5 ${isDarkMode ? 'text-blue-400' : 'text-[#001AFF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <a href={/^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-[#001AFF] hover:underline font-medium">
                  {link.label || link.url}
                </a>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveLink(link.id)}
                    className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                      isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="mt-2.5 space-y-1.5">
              <input
                ref={linkUrlRef}
                type="url"
                placeholder="https://example.com"
                className={`w-full px-3.5 py-2 rounded-xl text-[12px] outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700 text-white focus:border-[#001AFF] placeholder:text-gray-600'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#001AFF] placeholder:text-gray-300'
                }`}
              />
              <div className="flex gap-1.5">
                <input
                  ref={linkLabelRef}
                  type="text"
                  placeholder="표시 이름 (선택)"
                  className={`flex-1 px-3.5 py-2 rounded-xl text-[12px] outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border border-gray-700 text-white focus:border-[#001AFF] placeholder:text-gray-600'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#001AFF] placeholder:text-gray-300'
                  }`}
                />
                <button
                  onClick={handleAddLink}
                  className="px-4 py-2 text-[12px] font-semibold rounded-xl text-white bg-[#001AFF] hover:bg-[#0015D4] transition-colors shadow-sm shadow-[#001AFF]/20"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* slideInRight 애니메이션 */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
