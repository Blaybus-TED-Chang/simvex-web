'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import Link from 'next/link';
import { testModel } from '@/data/models/test';
import { CombinedGLBViewer } from '@/components/viewer/CombinedGLBPart';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

interface DebugInfo {
  meshCount: number;
  partIds: string[];
  allMeshNames: string[];
}

export default function TestViewerPage() {
  const [explodeValue, setExplodeValue] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedPart = testModel.parts.find(p => p.id === selectedPartId);

  if (!mounted) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/models" className="text-gray-400 hover:text-white">
            ← Back
          </Link>
          <h1 className="font-semibold">{testModel.nameKo}</h1>
          <span className="text-xs text-gray-500">통합 GLB 테스트</span>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* 3D Viewport */}
        <div className="flex-1 p-4">
          <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
            <Canvas
              shadows
              camera={{
                position: testModel.cameraPosition || [5, 3, 5],
                fov: 50,
              }}
              onPointerMissed={() => setSelectedPartId(null)}
            >
              <color attach="background" args={['#111']} />
              <ambientLight intensity={1.2} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
              <directionalLight position={[-5, 5, -5]} intensity={0.8} />

              <Suspense fallback={<LoadingFallback />}>
                <CombinedGLBViewer
                  model={testModel}
                  explodeValue={explodeValue}
                  selectedPartId={selectedPartId}
                  hoveredPartId={hoveredPartId}
                  visibleParts={[]}
                  onSelectPart={setSelectedPartId}
                  onHoverPart={setHoveredPartId}
                  onDebugInfo={setDebugInfo}
                />
              </Suspense>

              <axesHelper args={[2]} />
              <Grid
                args={[20, 20]}
                position={[0, -0.01, 0]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#404040"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#606060"
                fadeDistance={30}
              />

              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={1}
                maxDistance={50}
              />
            </Canvas>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
          {/* Explode Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">분해도</label>
              <span className="text-sm text-gray-400">{Math.round(explodeValue * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodeValue}
              onChange={(e) => setExplodeValue(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setExplodeValue(0)}
                className="flex-1 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              >
                조립
              </button>
              <button
                onClick={() => setExplodeValue(1)}
                className="flex-1 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              >
                분해
              </button>
            </div>
          </div>

          {/* Selected Part Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">선택된 부품</h3>
            {selectedPart ? (
              <div className="bg-gray-800 rounded p-3">
                <div className="font-medium text-cyan-400">{selectedPart.nameKo}</div>
                <div className="text-xs text-gray-500 mb-2">{selectedPart.name}</div>
                <div className="text-sm text-gray-400">{selectedPart.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  메시 이름: <code className="bg-gray-900 px-1 rounded">{selectedPart.meshName}</code>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">부품을 클릭하여 선택하세요</div>
            )}
          </div>

          {/* Parts List */}
          <div>
            <h3 className="text-sm font-medium mb-2">부품 목록</h3>
            <div className="space-y-1">
              {testModel.parts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setSelectedPartId(part.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedPartId === part.id
                      ? 'bg-cyan-600/30 text-cyan-400'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{part.nameKo}</div>
                  <div className="text-xs text-gray-500">{part.meshName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium mb-2">GLB 정보</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <div>파일: {testModel.glbPath}</div>
              <div>설정된 부품 수: {testModel.parts.length}</div>
            </div>
          </div>

          {/* Runtime Debug Info */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium mb-2">런타임 디버그</h3>
            <div className="text-xs space-y-2">
              <div className={debugInfo ? (debugInfo.meshCount > 0 ? 'text-green-400' : 'text-red-400') : 'text-yellow-400'}>
                추출된 메시: {debugInfo?.meshCount ?? '로딩 중...'} / {testModel.parts.length}
              </div>
              <div className="text-cyan-400 font-mono">
                분해 값: {explodeValue.toFixed(2)}
              </div>
              {debugInfo && debugInfo.meshCount > 0 ? (
                <div className="text-gray-400 space-y-1">
                  {debugInfo.partIds.map(id => (
                    <div key={id} className="bg-gray-800 px-2 py-1 rounded">
                      {id}
                    </div>
                  ))}
                </div>
              ) : debugInfo && debugInfo.meshCount === 0 ? (
                <div className="text-red-400 bg-red-900/30 p-2 rounded space-y-2">
                  <div>메시를 찾을 수 없습니다.</div>
                  <div className="text-xs">
                    <div className="text-yellow-400 mb-1">GLB에서 발견된 메시:</div>
                    {debugInfo.allMeshNames.map((name, i) => (
                      <div key={i} className="bg-gray-800 px-1 rounded mb-1 font-mono break-all">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Position Debug */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium mb-2">예상 위치 (분해 시)</h3>
            <div className="text-xs space-y-1">
              {testModel.parts.map(part => {
                const [dx, dy, dz] = part.explodeDirection;
                const dist = part.explodeDistance * explodeValue;
                return (
                  <div key={part.id} className="text-gray-500">
                    <span className="text-gray-400">{part.nameKo}:</span>{' '}
                    <span className="font-mono">
                      [{(dx * dist).toFixed(1)}, {(dy * dist).toFixed(1)}, {(dz * dist).toFixed(1)}]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
