
export interface PdfNoteItem {
  title: string;
  content: string; // plain text로 변환된 노트 내용
  updatedAt: string;
}

export interface PdfChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PdfAISummary {
  keyPoints: string[];
  summary: string;
}

export interface PdfExportData {
  modelNameKo: string;
  modelName: string;
  description: string;
  theory: string;
  noteItems: PdfNoteItem[];
  chatMessages: PdfChatMessage[];
  screenshotDataUrl: string; // base64 data URL
  aiSummary?: PdfAISummary;
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

// ── PDF 생성 (섹션 단위 페이지 분할) ──

const CONTAINER_W = 800;   // px
const RENDER_SCALE = 1.5;
const PAGE_W_MM = 210;     // A4
const PAGE_H_MM = 297;
const MARGIN_MM = 15;
const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2; // 180mm

const BASE_FONT = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;`;
const TITLE_STYLE = `font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;`;

export async function generateModelPdf(data: PdfExportData): Promise<Blob> {
  // 동적 import: 초기 번들에서 ~650KB 제외 (클릭 시점에 로드)
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  // ── 1. 섹션별 HTML 구성 ──
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    box-sizing: border-box;
    width: ${CONTAINER_W}px;
    padding: 0 40px;
    background: white;
    ${BASE_FONT}
    color: #333;
  `;

  const sectionEls: HTMLDivElement[] = [];

  function addSection(html: string, marginBottom = 16) {
    const div = document.createElement('div');
    div.style.marginBottom = `${marginBottom}px`;
    div.innerHTML = html;
    container.appendChild(div);
    sectionEls.push(div);
  }

  // 헤더
  addSection(`
    <div style="text-align: center; padding-top: 20px;">
      <h1 style="font-size: 28px; margin: 0 0 8px 0; color: #1a1a1a;">${escapeHtml(data.modelNameKo)}</h1>
      <p style="font-size: 16px; color: #666; margin: 0;">${escapeHtml(data.modelName)}</p>
    </div>
  `, 20);

  // 스크린샷
  if (data.screenshotDataUrl) {
    addSection(`
      <div style="text-align: center;">
        <img src="${data.screenshotDataUrl}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
    `, 24);
  }

  // AI 학습 정리
  if (data.aiSummary) {
    addSection(`
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px;">
        <h2 style="font-size: 18px; color: #1d4ed8; margin: 0 0 14px 0; display: flex; align-items: center; gap: 6px;">
          AI 학습 정리
        </h2>
        <div style="margin-bottom: 14px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 8px 0;">핵심 포인트</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.7; color: #1e3a5f;">
            ${data.aiSummary.keyPoints.map(p => `<li style="margin-bottom: 4px;">${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h3 style="font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 8px 0;">학습 요약</h3>
          <p style="font-size: 13px; line-height: 1.7; margin: 0; white-space: pre-wrap; color: #1e3a5f;">${escapeHtml(data.aiSummary.summary)}</p>
        </div>
      </div>
    `, 20);
  }

  // 설명
  addSection(`
    <h2 style="${TITLE_STYLE}">설명</h2>
    <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(data.description)}</p>
  `);

  // 이론 — 번호 섹션 또는 단락 단위로 분할
  if (data.theory) {
    addSection(`<h2 style="${TITLE_STYLE}">이론 및 원리</h2>`, 4);

    const numbered = data.theory.split(/\n(?=\d+\.\s)/).filter(t => t.trim());
    const chunks = numbered.length > 1
      ? numbered
      : data.theory.split(/\n\n+/).filter(p => p.trim());

    for (const chunk of chunks) {
      addSection(`
        <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(chunk)}</p>
      `, 8);
    }
  }

  // 학습 노트
  if (data.noteItems.length > 0) {
    addSection(`<h2 style="${TITLE_STYLE}">학습 노트</h2>`, 8);
    for (const note of data.noteItems) {
      addSection(`
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
          <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px;">${escapeHtml(note.title)}</div>
          <div style="font-size: 11px; color: #999; margin-bottom: 8px;">${new Date(note.updatedAt).toLocaleDateString('ko-KR')}</div>
          <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #444;">${escapeHtml(note.content)}</div>
        </div>
      `, 12);
    }
  }

  // AI 대화
  if (data.chatMessages.length > 0) {
    addSection(`<h2 style="${TITLE_STYLE}">AI 대화 내역</h2>`, 8);
    for (const msg of data.chatMessages) {
      addSection(`
        <div style="display: flex; gap: 10px;">
          <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: ${msg.role === 'user' ? '#e0e7ff' : '#f0fdf4'}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: ${msg.role === 'user' ? '#4338ca' : '#166534'};">
            ${msg.role === 'user' ? 'Q' : 'A'}
          </div>
          <div style="flex: 1; font-size: 13px; line-height: 1.6; padding: 10px 14px; border-radius: 8px; background: ${msg.role === 'user' ? '#f0f4ff' : '#f7fdf9'}; color: #333; white-space: pre-wrap;">${escapeHtml(msg.content)}</div>
        </div>
      `, 10);
    }
  }

  // 푸터
  addSection(`
    <div style="padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        VEXA - 3D 기계 부품 학습 뷰어 | ${new Date().toLocaleDateString('ko-KR')}
      </p>
    </div>
  `, 0);

  document.body.appendChild(container);

  try {
    // ── 2. 전체를 한 번에 렌더링 ──
    const fullCanvas = await html2canvas(container, {
      scale: RENDER_SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    // ── 3. 섹션 경계 측정 (canvas pixel 단위) ──
    const boundaries: number[] = sectionEls.map(el => el.offsetTop * RENDER_SCALE);
    boundaries.push(fullCanvas.height);

    // ── 4. 페이지 분할 — 섹션 경계에서만 끊기 ──
    const pageContentHPx = ((PAGE_H_MM - MARGIN_MM * 2) / CONTENT_W_MM) * fullCanvas.width;

    const pages: { startPx: number; endPx: number }[] = [];
    let pageStart = 0;

    while (pageStart < fullCanvas.height) {
      const pageEndLimit = pageStart + pageContentHPx;

      // 남은 콘텐츠가 한 페이지에 들어가면 종료
      if (pageEndLimit >= fullCanvas.height) {
        pages.push({ startPx: pageStart, endPx: fullCanvas.height });
        break;
      }

      // pageEndLimit 이하이면서 pageStart 초과인 가장 큰 경계 찾기
      let bestBreak = pageStart;
      for (const b of boundaries) {
        if (b > pageStart && b <= pageEndLimit) {
          bestBreak = b;
        }
      }

      // 경계가 없으면 (섹션이 페이지보다 큰 경우) 강제 분할
      if (bestBreak <= pageStart) {
        bestBreak = pageEndLimit;
      }

      pages.push({ startPx: pageStart, endPx: bestBreak });
      pageStart = bestBreak;
    }

    // ── 5. 페이지별 크롭 → PDF 출력 ──
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();

      const { startPx, endPx } = pages[i];
      const heightPx = endPx - startPx;
      if (heightPx <= 0) continue;

      const heightMm = (heightPx / fullCanvas.width) * CONTENT_W_MM;

      // 해당 영역만 잘라내기
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = fullCanvas.width;
      pageCanvas.height = Math.ceil(heightPx);
      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        fullCanvas,
        0, Math.floor(startPx), fullCanvas.width, Math.ceil(heightPx),
        0, 0, fullCanvas.width, Math.ceil(heightPx),
      );

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.85);
      pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_W_MM, heightMm);
    }

    return pdf.output('blob');
  } finally {
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
