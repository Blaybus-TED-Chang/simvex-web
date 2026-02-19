'use client';

import { Line, Html } from '@react-three/drei';

interface Measurement {
  pointA: [number, number, number];
  pointB: [number, number, number];
  distance: number;
}

interface MeasurementOverlayProps {
  measurements: Measurement[];
  pendingPoint: [number, number, number] | null;
  modelScale: number;
}

export function MeasurementOverlay({ measurements, pendingPoint, modelScale }: MeasurementOverlayProps) {
  return (
    <group>
      {/* 완성된 측정선들 */}
      {measurements.map((m, i) => {
        const mid: [number, number, number] = [
          (m.pointA[0] + m.pointB[0]) / 2,
          (m.pointA[1] + m.pointB[1]) / 2,
          (m.pointA[2] + m.pointB[2]) / 2,
        ];
        // 실제 거리 (모델 스케일 반영)
        const displayDist = m.distance / modelScale;
        return (
          <group key={i}>
            {/* 측정선 */}
            <Line
              points={[m.pointA, m.pointB]}
              color="#EF4444"
              lineWidth={2.5}
            />
            {/* 시작점 구체 */}
            <mesh position={m.pointA}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
            {/* 끝점 구체 */}
            <mesh position={m.pointB}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
            {/* 거리 라벨 */}
            <Html position={mid} center style={{ pointerEvents: 'none' }}>
              <div
                className="px-2 py-1 rounded-md text-white text-xs font-mono whitespace-nowrap shadow-lg"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}
              >
                {displayDist.toFixed(3)}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 첫 번째 점만 찍은 상태 (pending) */}
      {pendingPoint && (
        <mesh position={pendingPoint}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
      )}
    </group>
  );
}
