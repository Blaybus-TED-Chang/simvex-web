import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfNoteItem {
  title: string;
  content: string; // plain text로 변환된 노트 내용
  updatedAt: string;
}

export interface PdfChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PdfExportData {
  modelNameKo: string;
  modelName: string;
  description: string;
  theory: string;
  noteItems: PdfNoteItem[];
  chatMessages: PdfChatMessage[];
  screenshotDataUrl: string; // base64 data URL
}

// tiptap JSONContent에서 plain text 추출
export function jsonContentToText(content: unknown): string {
  if (!content || typeof content !== 'object') return '';
  const node = content as { type?: string; text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (!Array.isArray(node.content)) return '';
  return node.content
    .map((child) => jsonContentToText(child))
    .join(node.type === 'doc' || node.type === 'bulletList' || node.type === 'orderedList' ? '\n' : '')
    .replace(/\n{3,}/g, '\n\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// HTML 요소를 생성하여 이미지로 변환 후 PDF에 추가
export async function generateModelPdf(data: PdfExportData): Promise<Blob> {
  // 임시 HTML 컨테이너 생성
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: white;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
    color: #333;
  `;

  // 노트 HTML 생성
  const notesHtml = data.noteItems.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">학습 노트</h2>
        ${data.noteItems.map((note) => `
          <div style="margin-bottom: 16px; background: #f9fafb; padding: 16px; border-radius: 8px;">
            <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px;">${escapeHtml(note.title)}</div>
            <div style="font-size: 11px; color: #999; margin-bottom: 8px;">${new Date(note.updatedAt).toLocaleDateString('ko-KR')}</div>
            <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #444;">${escapeHtml(note.content)}</div>
          </div>
        `).join('')}
      </div>
    `
    : '';

  // AI 대화 HTML 생성
  const chatHtml = data.chatMessages.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">AI 대화 내역</h2>
        ${data.chatMessages.map((msg) => `
          <div style="margin-bottom: 10px; display: flex; gap: 10px;">
            <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: ${msg.role === 'user' ? '#e0e7ff' : '#f0fdf4'}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: ${msg.role === 'user' ? '#4338ca' : '#166534'};">
              ${msg.role === 'user' ? 'Q' : 'A'}
            </div>
            <div style="flex: 1; font-size: 13px; line-height: 1.6; padding: 10px 14px; border-radius: 8px; background: ${msg.role === 'user' ? '#f0f4ff' : '#f7fdf9'}; color: #333; white-space: pre-wrap;">${escapeHtml(msg.content)}</div>
          </div>
        `).join('')}
      </div>
    `
    : '';

  // PDF 콘텐츠 HTML 생성
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 28px; margin: 0 0 8px 0; color: #1a1a1a;">${escapeHtml(data.modelNameKo)}</h1>
      <p style="font-size: 16px; color: #666; margin: 0;">${escapeHtml(data.modelName)}</p>
    </div>

    ${data.screenshotDataUrl ? `
      <div style="margin-bottom: 30px; text-align: center;">
        <img src="${data.screenshotDataUrl}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
    ` : ''}

    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">설명</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(data.description)}</p>
    </div>

    ${data.theory ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">이론 및 원리</h2>
        <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(data.theory)}</p>
      </div>
    ` : ''}

    ${notesHtml}

    ${chatHtml}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        VEXA - 3D 기계 부품 학습 뷰어 | ${new Date().toLocaleDateString('ko-KR')}
      </p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // HTML을 캔버스로 변환 (scale 1.5로 적절한 해상도 유지)
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    // JPEG로 변환하여 용량 감소 (품질 0.85)
    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    // 캔버스 크기에 맞는 PDF 생성
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지 (이미 생성된 imgData 재사용)
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 필요한 경우 추가 페이지 (동일한 imgData 재사용)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    // 임시 컨테이너 제거
    document.body.removeChild(container);
  }
}

// 캔버스에서 스크린샷 캡처 (JPEG로 용량 최적화)
export async function captureCanvasScreenshot(
  canvasSelector: string = 'canvas'
): Promise<string> {
  const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // JPEG 품질 0.85로 용량 감소
  return canvas.toDataURL('image/jpeg', 0.85);
}
