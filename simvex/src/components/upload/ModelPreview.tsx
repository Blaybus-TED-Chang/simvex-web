'use client';

import { useMemo, useRef } from 'react';
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
    <div className="w-full aspect-video rounded-xl overflow-hidden">
      <CombinedModelViewer
        model={previewModel}
        explodeValue={0}
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
  );
}
