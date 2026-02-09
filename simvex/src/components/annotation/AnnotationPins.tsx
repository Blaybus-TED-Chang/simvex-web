'use client';

import { useState, useRef, useCallback } from 'react';
import { Html } from '@react-three/drei';
import type { AnnotationRow } from '@/types/annotation';
import type { CombinedPartConfig } from '@/components/viewer/CombinedGLBPart';

interface DragTargetInfo {
  targetType: 'part' | 'coordinate';
  partId?: string;
}

interface AnnotationPinsProps {
  annotations: AnnotationRow[];
  activeAnnotationId: string | null;
  showAllAnnotations?: boolean;
  explodeValue: number;
  parts: CombinedPartConfig[];
  modelScale: number;
  onPinClick: (id: string) => void;
  // 드래그 관련 props
  draggingAnnotationId?: string | null;
  dragPreviewPosition?: [number, number, number] | null;
  dragTargetInfo?: DragTargetInfo | null;
  onDragStart?: (id: string) => void;
  isPlacingPin?: boolean;
}

const DRAG_THRESHOLD = 5; // px

function PinMarker({
  annotation,
  isActive,
  forceShowTooltip,
  explodeValue,
  parts,
  modelScale,
  onPinClick,
  isDragging,
  onDragStart,
  isPlacingPin,
}: {
  annotation: AnnotationRow;
  isActive: boolean;
  forceShowTooltip?: boolean;
  explodeValue: number;
  parts: CombinedPartConfig[];
  modelScale: number;
  onPinClick: (id: string) => void;
  isDragging?: boolean;
  onDragStart?: (id: string) => void;
  isPlacingPin?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartedRef = useRef(false);

  // 기본 좌표
  const [bx, by, bz] = annotation.position as [number, number, number];
  let x = bx;
  let y = by;
  let z = bz;

  // 부품 핀: 분해 시 부품 따라 이동
  if (annotation.target_type === 'part' && annotation.part_id) {
    const part = parts.find((p) => p.id === annotation.part_id);
    if (part) {
      const [dx, dy, dz] = part.explodeDirection;
      const dist = part.explodeDistance * explodeValue;
      x += dx * dist;
      y += dy * dist;
      z += dz * dist;
    }
  }

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isPlacingPin || !onDragStart) return;
      pointerDownRef.current = { x: e.clientX, y: e.clientY };
      dragStartedRef.current = false;
    },
    [isPlacingPin, onDragStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerDownRef.current || dragStartedRef.current || !onDragStart) return;
      const dx = e.clientX - pointerDownRef.current.x;
      const dy = e.clientY - pointerDownRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
        dragStartedRef.current = true;
        pointerDownRef.current = null;
        onDragStart(annotation.id);
      }
    },
    [onDragStart, annotation.id]
  );

  const handlePointerUp = useCallback(() => {
    pointerDownRef.current = null;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // 드래그가 시작된 경우 클릭 무시
      if (dragStartedRef.current) {
        dragStartedRef.current = false;
        return;
      }
      onPinClick(annotation.id);
    },
    [onPinClick, annotation.id]
  );

  return (
    <group position={[x * modelScale, y * modelScale, z * modelScale]}>
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: isDragging ? 'none' : 'auto',
          opacity: isDragging ? 0.4 : 1,
          transition: 'opacity 0.15s',
        }}
        zIndexRange={[100, 0]}
      >
        <div
          className="relative select-none"
          data-annotation-pin={annotation.id}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => {
            setHovered(false);
            pointerDownRef.current = null;
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
        >
          {/* 핀 아이콘 */}
          <div
            data-pin-icon
            className="flex items-center justify-center rounded-full shadow-lg cursor-grab transition-transform"
            style={{
              width: isActive ? 28 : 22,
              height: isActive ? 28 : 22,
              backgroundColor: annotation.color || '#3B82F6',
              border: isActive ? '3px solid white' : '2px solid rgba(255,255,255,0.8)',
              transform: isActive ? 'scale(1.2)' : hovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <svg
              width={isActive ? 14 : 11}
              height={isActive ? 14 : 11}
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>

          {/* 말풍선 (호버 또는 활성 또는 전체 표시) — 드래그 중엔 숨김 */}
          {!isDragging && (hovered || isActive || forceShowTooltip) && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
              style={{ zIndex: 200 }}
              onWheel={(e) => e.stopPropagation()}
              data-tooltip-box
              data-title={annotation.title || ''}
              data-content={annotation.content || ''}
            >
              <div
                className="rounded-lg px-4 py-3 shadow-xl text-white text-sm"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.88)',
                  minWidth: 120,
                  maxWidth: 320,
                  width: 'max-content',
                }}
              >
                {annotation.title && (
                  <div className="font-semibold leading-snug" style={{ wordBreak: 'break-word' }}>
                    {annotation.title}
                  </div>
                )}
                {annotation.content && (
                  <div
                    className="opacity-85 leading-relaxed"
                    style={{
                      marginTop: annotation.title ? 4 : 0,
                      wordBreak: 'break-word',
                      maxHeight: 160,
                      overflowY: 'auto',
                    }}
                  >
                    {annotation.content}
                  </div>
                )}
                {!annotation.title && !annotation.content && (
                  <div className="opacity-60">(빈 주석)</div>
                )}
              </div>
              {/* 말풍선 꼬리 */}
              <div
                className="w-0 h-0 mx-auto"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgba(0,0,0,0.88)',
                }}
              />
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

/** 드래그 중 프리뷰 핀 */
function DragPreviewPin({
  position,
  targetInfo,
  explodeValue,
  parts,
  modelScale,
}: {
  position: [number, number, number];
  targetInfo: DragTargetInfo | null;
  explodeValue: number;
  parts: CombinedPartConfig[];
  modelScale: number;
}) {
  let [x, y, z] = position;

  // 프리뷰도 분해 오프셋 적용 (부품 위일 때)
  if (targetInfo?.targetType === 'part' && targetInfo.partId) {
    const part = parts.find((p) => p.id === targetInfo.partId);
    if (part) {
      const [dx, dy, dz] = part.explodeDirection;
      const dist = part.explodeDistance * explodeValue;
      x += dx * dist;
      y += dy * dist;
      z += dz * dist;
    }
  }

  return (
    <group position={[x * modelScale, y * modelScale, z * modelScale]}>
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
        <div className="flex items-center justify-center rounded-full animate-pulse"
          style={{
            width: 26,
            height: 26,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            border: '2px dashed rgba(255,255,255,0.9)',
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="white" opacity={0.8}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      </Html>
    </group>
  );
}

export function AnnotationPins({
  annotations,
  activeAnnotationId,
  showAllAnnotations,
  explodeValue,
  parts,
  modelScale,
  onPinClick,
  draggingAnnotationId,
  dragPreviewPosition,
  dragTargetInfo,
  onDragStart,
  isPlacingPin,
}: AnnotationPinsProps) {
  if (annotations.length === 0 && !dragPreviewPosition) return null;

  return (
    <>
      {annotations.map((ann) => (
        <PinMarker
          key={ann.id}
          annotation={ann}
          isActive={activeAnnotationId === ann.id}
          forceShowTooltip={showAllAnnotations}
          explodeValue={explodeValue}
          parts={parts}
          modelScale={modelScale}
          onPinClick={onPinClick}
          isDragging={draggingAnnotationId === ann.id}
          onDragStart={onDragStart}
          isPlacingPin={isPlacingPin}
        />
      ))}

      {/* 드래그 프리뷰 핀 */}
      {draggingAnnotationId && dragPreviewPosition && (
        <DragPreviewPin
          position={dragPreviewPosition}
          targetInfo={dragTargetInfo ?? null}
          explodeValue={explodeValue}
          parts={parts}
          modelScale={modelScale}
        />
      )}
    </>
  );
}
