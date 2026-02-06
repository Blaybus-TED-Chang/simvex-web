'use client';

import type { UserModelPartConfig } from '@/types/userModel';

interface PartConfigEditorProps {
  parts: UserModelPartConfig[];
  onChange: (parts: UserModelPartConfig[]) => void;
  isDarkMode: boolean;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
}

export function PartConfigEditor({
  parts,
  onChange,
  isDarkMode,
  selectedPartId,
  onSelectPart,
}: PartConfigEditorProps) {
  const updatePart = (index: number, updates: Partial<UserModelPartConfig>) => {
    const next = parts.map((p, i) => (i === index ? { ...p, ...updates } : p));
    onChange(next);
  };

  const inputClass = `w-full px-2 py-1 text-sm rounded border ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClass = `block text-xs mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`;

  return (
    <div className="space-y-2">
      <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        부품 설정 ({parts.length}개)
      </h3>

      <div className="space-y-2 pr-1">
        {parts.map((part, i) => (
          <div
            key={part.id}
            onClick={() => onSelectPart(part.id === selectedPartId ? null : part.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedPartId === part.id
                ? 'border-blue-500 ring-1 ring-blue-500/30'
                : isDarkMode
                  ? 'border-gray-800 hover:border-gray-700'
                  : 'border-gray-200 hover:border-gray-300'
            } ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={part.color}
                onChange={(e) => updatePart(i, { color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={part.nameKo}
                onChange={(e) => updatePart(i, { nameKo: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="부품 이름"
                className={`flex-1 ${inputClass}`}
              />
            </div>

            <div className="mb-2">
              <label className={labelClass}>메시 이름</label>
              <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {part.meshName}
              </p>
            </div>

            <div className="mb-2">
              <label className={labelClass}>설명</label>
              <input
                type="text"
                value={part.description}
                onChange={(e) => updatePart(i, { description: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="부품 역할/기능 설명"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className={labelClass}>X방향</label>
                <input
                  type="number"
                  step="0.1"
                  value={part.explodeDirection[0]}
                  onChange={(e) => {
                    const d = [...part.explodeDirection] as [number, number, number];
                    d[0] = parseFloat(e.target.value) || 0;
                    updatePart(i, { explodeDirection: d });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Y방향</label>
                <input
                  type="number"
                  step="0.1"
                  value={part.explodeDirection[1]}
                  onChange={(e) => {
                    const d = [...part.explodeDirection] as [number, number, number];
                    d[1] = parseFloat(e.target.value) || 0;
                    updatePart(i, { explodeDirection: d });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Z방향</label>
                <input
                  type="number"
                  step="0.1"
                  value={part.explodeDirection[2]}
                  onChange={(e) => {
                    const d = [...part.explodeDirection] as [number, number, number];
                    d[2] = parseFloat(e.target.value) || 0;
                    updatePart(i, { explodeDirection: d });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>거리</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={part.explodeDistance}
                  onChange={(e) => updatePart(i, { explodeDistance: parseFloat(e.target.value) || 0 })}
                  onClick={(e) => e.stopPropagation()}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
