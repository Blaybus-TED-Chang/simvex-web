/**
 * Canvas 요소에서 썸네일 PNG Blob 캡처
 * preserveDrawingBuffer: true 필요 (CombinedModelViewer에서 설정됨)
 */
export function captureCanvasThumbnail(
  canvas: HTMLCanvasElement,
  maxSize = 512
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // 리사이즈용 offscreen canvas
    const offscreen = document.createElement('canvas');
    const aspect = canvas.width / canvas.height;

    if (aspect >= 1) {
      offscreen.width = maxSize;
      offscreen.height = Math.round(maxSize / aspect);
    } else {
      offscreen.height = maxSize;
      offscreen.width = Math.round(maxSize * aspect);
    }

    const ctx = offscreen.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D 컨텍스트 생성 실패'));

    ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);

    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Blob 변환 실패'));
      },
      'image/png',
      0.9
    );
  });
}
