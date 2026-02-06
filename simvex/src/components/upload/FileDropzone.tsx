'use client';

import { useCallback, useState, useRef } from 'react';
import { MAX_FILE_SIZE_BYTES } from '@/types/userModel';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isDarkMode: boolean;
  disabled?: boolean;
  currentFileName?: string;
}

const ACCEPT = '.glb,.fbx';
const ACCEPT_TYPES = ['model/gltf-binary', 'application/octet-stream', ''];

export function FileDropzone({ onFileSelected, isDarkMode, disabled, currentFileName }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'fbx') return 'GLB 또는 FBX 파일만 지원합니다';
    if (file.size > MAX_FILE_SIZE_BYTES) return '파일 크기는 50MB 이하여야 합니다';
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [validate, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          dragging
            ? 'border-blue-500 bg-blue-500/10'
            : isDarkMode
              ? 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <svg
          className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {currentFileName ? (
          <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            {currentFileName}
          </p>
        ) : (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            GLB 또는 FBX 파일을 드래그하거나 클릭하여 선택
          </p>
        )}
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          최대 50MB
        </p>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
