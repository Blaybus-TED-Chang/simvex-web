'use client';

import { useState, useCallback } from 'react';
import {
  generateModelPdf,
  PdfExportData,
  PdfNoteItem,
  PdfChatMessage,
  captureCanvasScreenshot,
} from '@/lib/export/pdfGenerator';

interface ExportPdfButtonProps {
  modelNameKo: string;
  modelName: string;
  description: string;
  theory: string;
  noteItems: PdfNoteItem[];
  chatMessages: PdfChatMessage[];
  isDarkMode: boolean;
}

export function ExportPdfButton({
  modelNameKo,
  modelName,
  description,
  theory,
  noteItems,
  chatMessages,
  isDarkMode,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      // 3D 캔버스 스크린샷 캡처
      let screenshotDataUrl = '';
      try {
        screenshotDataUrl = await captureCanvasScreenshot('canvas');
      } catch (e) {
        console.warn('Failed to capture canvas screenshot:', e);
      }

      const exportData: PdfExportData = {
        modelNameKo,
        modelName,
        description,
        theory,
        noteItems,
        chatMessages,
        screenshotDataUrl,
      };

      const pdfBlob = await generateModelPdf(exportData);

      // 다운로드
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SIMVEX_${modelName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  }, [modelNameKo, modelName, description, theory, noteItems, chatMessages]);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`p-2 rounded-lg transition-colors relative ${
        isExporting
          ? isDarkMode
            ? 'bg-gray-700 text-gray-500 cursor-wait'
            : 'bg-gray-200 text-gray-400 cursor-wait'
          : isDarkMode
          ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
      }`}
      title="PDF로 내보내기"
    >
      {isExporting ? (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
    </button>
  );
}
