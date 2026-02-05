'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';
import type { UserModelPartConfig } from '@/types/userModel';

const CombinedModelViewer = dynamic(
  () => import('@/components/viewer/CombinedGLBPart').then((mod) => mod.CombinedModelViewer),
  { ssr: false }
);

interface ModelPreviewProps {
  glbUrl: string;
  parts: UserModelPartConfig[];
  scale: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  isDarkMode: boolean;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
}

export function ModelPreview({
  glbUrl,
  parts,
  scale,
  cameraPosition,
  cameraTarget,
  isDarkMode,
  selectedPartId,
  onSelectPart,
}: ModelPreviewProps) {
  const [explodeValue, setExplodeValue] = useState(0);

  const previewModel: CombinedModelConfig = useMemo(
    () => ({
      id: 'preview',
      name: 'Preview',
      nameKo: '미리보기',
      description: '',
      theory: '',
      category: '',
      thumbnail: '',
      glbPath: glbUrl,
      scale,
      cameraPosition,
      cameraTarget,
      parts: parts.map((p) => ({
        id: p.id,
        meshName: p.meshName,
        name: p.nameKo,
        nameKo: p.nameKo,
        description: p.description,
        explodeDirection: p.explodeDirection,
        explodeDistance: p.explodeDistance,
        color: p.color,
      })),
    }),
    [glbUrl, parts, scale, cameraPosition, cameraTarget]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden">
        <CombinedModelViewer
          model={previewModel}
          explodeValue={explodeValue}
          selectedPartId={selectedPartId}
          hoveredPartId={null}
          visibleParts={[]}
          onSelectPart={onSelectPart}
          onHoverPart={() => {}}
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* 분해도 슬라이더 */}
      <div className="mt-3 flex-shrink-0 flex items-center gap-3">
        <span className={`text-xs flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          조립
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explodeValue}
          onChange={(e) => setExplodeValue(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-gray-700 accent-blue-500"
        />
        <span className={`text-xs flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          분해
        </span>
        <span className={`text-xs w-10 text-right tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {Math.round(explodeValue * 100)}%
        </span>
      </div>
    </div>
  );
}
