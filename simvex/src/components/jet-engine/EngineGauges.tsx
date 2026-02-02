'use client';

import { useJetEngineStore } from '@/lib/store/jetEngineStore';

export default function EngineGauges() {
  const { output } = useJetEngineStore();

  return (
    <div>
      <h3 className="text-sm font-medium text-white mb-3">Engine Parameters</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Thrust */}
        <GaugeCard
          label="Thrust"
          value={output.thrust.toFixed(1)}
          unit="kN"
          max={300}
          current={output.thrust}
          color="#22c55e"
        />

        {/* Fuel Flow */}
        <GaugeCard
          label="Fuel Flow"
          value={output.fuelFlow.toFixed(0)}
          unit="kg/h"
          max={4000}
          current={output.fuelFlow}
          color="#f59e0b"
        />

        {/* N1 */}
        <GaugeCard
          label="N1"
          value={output.n1.toFixed(1)}
          unit="%"
          max={100}
          current={output.n1}
          color="#3b82f6"
          warning={95}
          danger={100}
        />

        {/* N2 */}
        <GaugeCard
          label="N2"
          value={output.n2.toFixed(1)}
          unit="%"
          max={100}
          current={output.n2}
          color="#8b5cf6"
          warning={95}
          danger={100}
        />

        {/* EGT */}
        <GaugeCard
          label="EGT"
          value={output.egt.toFixed(0)}
          unit="°C"
          max={900}
          current={output.egt}
          color="#ef4444"
          warning={800}
          danger={870}
        />

        {/* SFC */}
        <GaugeCard
          label="SFC"
          value={output.sfc.toFixed(2)}
          unit="kg/kN·h"
          max={20}
          current={output.sfc}
          color="#06b6d4"
        />
      </div>

      {/* Additional Info */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800 rounded p-2">
          <span className="text-gray-500">Airflow: </span>
          <span className="text-gray-300 font-mono">{output.airflow.toFixed(1)} kg/s</span>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <span className="text-gray-500">OPR: </span>
          <span className="text-gray-300 font-mono">{output.pressureRatio.toFixed(1)}:1</span>
        </div>
      </div>
    </div>
  );
}

interface GaugeCardProps {
  label: string;
  value: string;
  unit: string;
  max: number;
  current: number;
  color: string;
  warning?: number;
  danger?: number;
}

function GaugeCard({ label, value, unit, max, current, color, warning, danger }: GaugeCardProps) {
  const percentage = Math.min((current / max) * 100, 100);

  let barColor = color;
  if (danger && current >= danger) {
    barColor = '#ef4444';
  } else if (warning && current >= warning) {
    barColor = '#f59e0b';
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-gray-500">{label}</span>
        <div>
          <span className="text-lg font-mono text-white">{value}</span>
          <span className="text-xs text-gray-500 ml-1">{unit}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Warning/Danger markers */}
      {(warning || danger) && (
        <div className="relative h-1 mt-0.5">
          {warning && (
            <div
              className="absolute w-0.5 h-1 bg-yellow-500"
              style={{ left: `${(warning / max) * 100}%` }}
            />
          )}
          {danger && (
            <div
              className="absolute w-0.5 h-1 bg-red-500"
              style={{ left: `${(danger / max) * 100}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
