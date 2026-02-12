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

  const bg = isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const inputBg = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

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
    <div className={`fixed top-0 right-0 h-full w-96 border-l shadow-xl z-50 flex flex-col ${bg}`}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <span className="font-semibold text-sm">노드 상세</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 제목 */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">제목</label>
          {isOwner ? (
            <input
              value={node.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={`w-full px-3 py-2 rounded border text-sm outline-none ${inputBg}`}
              placeholder="노드 제목"
            />
          ) : (
            <p className="text-sm">{node.title || '제목 없음'}</p>
          )}
        </div>

        {/* 본문 */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">내용</label>
          {isOwner ? (
            <textarea
              value={node.content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full px-3 py-2 rounded border text-sm outline-none resize-y min-h-[120px] ${inputBg}`}
              placeholder="내용을 입력하세요..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{node.content || '(내용 없음)'}</p>
          )}
        </div>

        {/* 파일 첨부 */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            첨부 파일 ({attachments.length})
          </label>
          <div className="space-y-1">
            {attachments.map((att) => (
              <div key={att.id} className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <a
                  href={getDownloadUrl(att.storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-blue-400 hover:underline"
                >
                  {att.file_name}
                </a>
                <span className="text-gray-400 shrink-0">{formatFileSize(att.file_size_bytes)}</span>
                <button
                  onClick={() => handleDownload(att.storage_path, att.file_name)}
                  className="text-gray-400 hover:text-blue-400 shrink-0"
                  title="다운로드"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                {isOwner && (
                  <button onClick={() => onDeleteAttachment(att.id)} className="text-red-400 hover:text-red-600 shrink-0">
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="mt-2">
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`text-xs px-3 py-1.5 rounded border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} ${uploading ? 'opacity-50' : ''}`}
              >
                {uploading ? '업로드 중...' : '+ 파일 추가'}
              </button>
            </div>
          )}
        </div>

        {/* 링크 첨부 */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            링크 ({node.links.length})
          </label>
          <div className="space-y-1">
            {node.links.map((link) => (
              <div key={link.id} className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <a href={/^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-blue-400 hover:underline">
                  {link.label || link.url}
                </a>
                {isOwner && (
                  <button onClick={() => handleRemoveLink(link.id)} className="text-red-400 hover:text-red-600 shrink-0">
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="mt-2 space-y-1">
              <input
                ref={linkUrlRef}
                type="url"
                placeholder="URL"
                className={`w-full px-3 py-1.5 rounded border text-xs outline-none ${inputBg}`}
              />
              <div className="flex gap-1">
                <input
                  ref={linkLabelRef}
                  type="text"
                  placeholder="표시 이름 (선택)"
                  className={`flex-1 px-3 py-1.5 rounded border text-xs outline-none ${inputBg}`}
                />
                <button
                  onClick={handleAddLink}
                  className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
