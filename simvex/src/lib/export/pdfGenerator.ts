import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportData {
  modelNameKo: string;
  modelName: string;
  description: string;
  theory: string;
  parts: { nameKo: string; name: string; description: string }[];
  notes: string;
  screenshotDataUrl: string; // base64 data URL
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

  // PDF 콘텐츠 HTML 생성
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 28px; margin: 0 0 8px 0; color: #1a1a1a;">${data.modelNameKo}</h1>
      <p style="font-size: 16px; color: #666; margin: 0;">${data.modelName}</p>
    </div>

    ${data.screenshotDataUrl ? `
      <div style="margin-bottom: 30px; text-align: center;">
        <img src="${data.screenshotDataUrl}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
    ` : ''}

    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">설명</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.description}</p>
    </div>

    ${data.theory ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">이론 및 원리</h2>
        <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.theory}</p>
      </div>
    ` : ''}

    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">부품 목록</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 40px;">#</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 150px;">부품명</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">설명</th>
          </tr>
        </thead>
        <tbody>
          ${data.parts.map((part, idx) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; vertical-align: top;">${idx + 1}</td>
              <td style="padding: 10px; vertical-align: top; font-weight: 500;">${part.nameKo}<br/><span style="font-size: 11px; color: #888;">${part.name}</span></td>
              <td style="padding: 10px; vertical-align: top; color: #555;">${part.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${data.notes && data.notes.trim() ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">학습 노트</h2>
        <div style="font-size: 14px; line-height: 1.6; background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.notes}</div>
      </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        SIMVEX - 3D 기계 부품 학습 뷰어 | ${new Date().toLocaleDateString('ko-KR')}
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
