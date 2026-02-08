'use client';

import { useState } from 'react';
import { Html } from '@react-three/drei';
import type { AnnotationRow } from '@/types/annotation';
import type { CombinedPartConfig } from '@/components/viewer/CombinedGLBPart';

interface AnnotationPinsProps {
  annotations: AnnotationRow[];
  activeAnnotationId: string | null;
  explodeValue: number;
  parts: CombinedPartConfig[];
  modelScale: number;
  onPinClick: (id: string) => void;
}

function PinMarker({
  annotation,
  isActive,
  explodeValue,
  parts,
  modelScale,
  onPinClick,
}: {
  annotation: AnnotationRow;
  isActive: boolean;
  explodeValue: number;
  parts: CombinedPartConfig[];
  modelScale: number;
  onPinClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

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

  return (
    <group position={[x * modelScale, y * modelScale, z * modelScale]}>
      <Html
        center
        distanceFactor={8}
        style={{ pointerEvents: 'auto' }}
        zIndexRange={[100, 0]}
      >
        <div
          className="relative select-none"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            onPinClick(annotation.id);
          }}
        >
          {/* 핀 아이콘 */}
          <div
            className="flex items-center justify-center rounded-full shadow-lg cursor-pointer transition-transform"
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

          {/* 말풍선 (호버 또는 활성) */}
          {(hovered || isActive) && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
              style={{ zIndex: 200 }}
              onWheel={(e) => e.stopPropagation()}
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

export function AnnotationPins({
  annotations,
  activeAnnotationId,
  explodeValue,
  parts,
  modelScale,
  onPinClick,
}: AnnotationPinsProps) {
  if (annotations.length === 0) return null;

  return (
    <>
      {annotations.map((ann) => (
        <PinMarker
          key={ann.id}
          annotation={ann}
          isActive={activeAnnotationId === ann.id}
          explodeValue={explodeValue}
          parts={parts}
          modelScale={modelScale}
          onPinClick={onPinClick}
        />
      ))}
    </>
  );
}
