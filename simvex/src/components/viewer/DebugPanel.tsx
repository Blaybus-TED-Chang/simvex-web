'use client';

import { useState, useEffect } from 'react';
import { ModelConfig, PartConfig } from '@/types/viewer';
import { useViewerStore } from '@/lib/store/viewerStore';

interface DebugPanelProps {
  model: ModelConfig;
  onUpdatePart: (partId: string, updates: Partial<PartConfig>) => void;
  onUpdateCamera: (position: [number, number, number], target: [number, number, number]) => void;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export function DebugPanel({
  model,
  onUpdatePart,
  onUpdateCamera,
  cameraPosition,
  cameraTarget
}: DebugPanelProps) {
  const { selectedPartId } = useViewerStore();
  const [isOpen, setIsOpen] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const selectedPart = model.parts.find(p => p.id === selectedPartId);

  // 로컬 상태로 편집 값 관리
  const [localCameraPos, setLocalCameraPos] = useState(cameraPosition);
  const [localCameraTarget, setLocalCameraTarget] = useState(cameraTarget);
  const [localPartValues, setLocalPartValues] = useState<{
    assemblyPosition: [number, number, number];
    assemblyRotation: [number, number, number];
    explodeDirection: [number, number, number];
    explodeDistance: number;
  } | null>(null);

  // 선택된 부품이 변경되면 로컬 값 업데이트
  useEffect(() => {
    if (selectedPart) {
      setLocalPartValues({
        assemblyPosition: [...selectedPart.assemblyPosition] as [number, number, number],
        assemblyRotation: selectedPart.assemblyRotation
          ? [...selectedPart.assemblyRotation] as [number, number, number]
          : [0, 0, 0],
        explodeDirection: [...selectedPart.explodeDirection] as [number, number, number],
        explodeDistance: selectedPart.explodeDistance,
      });
    }
  }, [selectedPart]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const generatePartCode = () => {
    if (!selectedPart || !localPartValues) return '';
    return `{
  id: '${selectedPart.id}',
  glbFile: '${selectedPart.glbFile}',
  name: '${selectedPart.name}',
  nameKo: '${selectedPart.nameKo}',
  description: '${selectedPart.description}',
  material: '${selectedPart.material || ''}',
  assemblyPosition: [${localPartValues.assemblyPosition.map(v => v.toFixed(3)).join(', ')}],
  assemblyRotation: [${localPartValues.assemblyRotation.map(v => v.toFixed(0)).join(', ')}],
  explodeDirection: [${localPartValues.explodeDirection.map(v => v.toFixed(2)).join(', ')}],
  explodeDistance: ${localPartValues.explodeDistance.toFixed(3)},
  color: '${selectedPart.color || '#808080'}',
},`;
  };

  const generateCameraCode = () => {
    return `cameraPosition: [${localCameraPos.map(v => v.toFixed(2)).join(', ')}],
cameraTarget: [${localCameraTarget.map(v => v.toFixed(2)).join(', ')}],`;
  };

  const NumberInput = ({
    label,
    value,
    onChange,
    step = 0.01,
    min,
    max
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    step?: number;
    min?: number;
    max?: number;
  }) => (
    <div className="flex items-center gap-2">
      <label className="w-8 text-xs text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white w-20"
      />
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        step={step}
        min={min ?? -2}
        max={max ?? 2}
        className="flex-1 h-1"
      />
    </div>
  );

  const Vector3Input = ({
    label,
    value,
    onChange,
    step = 0.01,
    min,
    max
  }: {
    label: string;
    value: [number, number, number];
    onChange: (v: [number, number, number]) => void;
    step?: number;
    min?: number;
    max?: number;
  }) => (
    <div className="space-y-1">
      <div className="text-xs text-gray-300 font-medium">{label}</div>
      <div className="space-y-1 pl-2">
        <NumberInput label="X" value={value[0]} onChange={(v) => onChange([v, value[1], value[2]])} step={step} min={min} max={max} />
        <NumberInput label="Y" value={value[1]} onChange={(v) => onChange([value[0], v, value[2]])} step={step} min={min} max={max} />
        <NumberInput label="Z" value={value[2]} onChange={(v) => onChange([value[0], value[1], v])} step={step} min={min} max={max} />
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg shadow-lg hover:bg-purple-700"
      >
        Debug Panel
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-h-[80vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-3 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-purple-400">Debug Panel</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Camera Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-300 uppercase">Camera</h3>
            <button
              onClick={() => copyToClipboard(generateCameraCode(), 'camera')}
              className={`text-xs px-2 py-0.5 rounded ${
                copiedText === 'camera' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {copiedText === 'camera' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <Vector3Input
            label="Position"
            value={localCameraPos}
            onChange={(v) => {
              setLocalCameraPos(v);
              onUpdateCamera(v, localCameraTarget);
            }}
            step={0.1}
            min={-10}
            max={10}
          />

          <Vector3Input
            label="Target"
            value={localCameraTarget}
            onChange={(v) => {
              setLocalCameraTarget(v);
              onUpdateCamera(localCameraPos, v);
            }}
            step={0.05}
            min={-5}
            max={5}
          />
        </div>

        <div className="border-t border-gray-700" />

        {/* Selected Part Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase">Selected Part</h3>

          {selectedPart && localPartValues ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-cyan-400">{selectedPart.nameKo}</span>
                <button
                  onClick={() => copyToClipboard(generatePartCode(), 'part')}
                  className={`text-xs px-2 py-0.5 rounded ${
                    copiedText === 'part' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {copiedText === 'part' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <Vector3Input
                label="Assembly Position"
                value={localPartValues.assemblyPosition}
                onChange={(v) => {
                  setLocalPartValues({ ...localPartValues, assemblyPosition: v });
                  onUpdatePart(selectedPart.id, { assemblyPosition: v });
                }}
                step={0.01}
                min={-2}
                max={2}
              />

              <Vector3Input
                label="Assembly Rotation (deg)"
                value={localPartValues.assemblyRotation}
                onChange={(v) => {
                  setLocalPartValues({ ...localPartValues, assemblyRotation: v });
                  onUpdatePart(selectedPart.id, { assemblyRotation: v });
                }}
                step={15}
                min={-180}
                max={180}
              />

              <Vector3Input
                label="Explode Direction"
                value={localPartValues.explodeDirection}
                onChange={(v) => {
                  setLocalPartValues({ ...localPartValues, explodeDirection: v });
                  onUpdatePart(selectedPart.id, { explodeDirection: v });
                }}
                step={0.1}
                min={-1}
                max={1}
              />

              <div className="space-y-1">
                <div className="text-xs text-gray-300 font-medium">Explode Distance</div>
                <div className="pl-2">
                  <NumberInput
                    label=""
                    value={localPartValues.explodeDistance}
                    onChange={(v) => {
                      setLocalPartValues({ ...localPartValues, explodeDistance: v });
                      onUpdatePart(selectedPart.id, { explodeDistance: v });
                    }}
                    step={0.01}
                    min={0}
                    max={1}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">부품을 클릭하여 선택하세요</p>
          )}
        </div>

        <div className="border-t border-gray-700" />

        {/* All Parts Quick View */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase">All Parts</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {model.parts.map((part) => (
              <div
                key={part.id}
                className={`text-xs p-1 rounded cursor-pointer ${
                  selectedPartId === part.id
                    ? 'bg-cyan-600/30 text-cyan-400'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
                onClick={() => useViewerStore.getState().setSelectedPartId(part.id)}
              >
                {part.nameKo}
              </div>
            ))}
          </div>
        </div>

        {/* Export All Button */}
        <button
          onClick={() => {
            const allPartsCode = model.parts.map(p => {
              const code = `    {
      id: '${p.id}',
      glbFile: '${p.glbFile}',
      name: '${p.name}',
      nameKo: '${p.nameKo}',
      assemblyPosition: [${p.assemblyPosition.map(v => v.toFixed(3)).join(', ')}],
      assemblyRotation: [${(p.assemblyRotation || [0,0,0]).map(v => v.toFixed(0)).join(', ')}],
      explodeDirection: [${p.explodeDirection.map(v => v.toFixed(2)).join(', ')}],
      explodeDistance: ${p.explodeDistance.toFixed(3)},
    },`;
              return code;
            }).join('\n');
            copyToClipboard(allPartsCode, 'all');
          }}
          className={`w-full py-2 text-xs rounded ${
            copiedText === 'all' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {copiedText === 'all' ? 'Copied All Parts!' : 'Copy All Parts Code'}
        </button>
      </div>
    </div>
  );
}
