'use client';

import { useJetEngineStore } from '@/lib/store/jetEngineStore';

interface EngineGaugesProps {
  isDarkMode: boolean;
}

export default function EngineGauges({ isDarkMode }: EngineGaugesProps) {
  const { output } = useJetEngineStore();

  return (
    <div>
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Engine Parameters</h3>

      <div className="grid grid-cols-2 gap-3">
        <GaugeCard label="Thrust" value={output.thrust.toFixed(1)} unit="kN" max={300} current={output.thrust} color="#22c55e" isDarkMode={isDarkMode} />
        <GaugeCard label="Fuel Flow" value={output.fuelFlow.toFixed(0)} unit="kg/h" max={4000} current={output.fuelFlow} color="#f59e0b" isDarkMode={isDarkMode} />
        <GaugeCard label="N1" value={output.n1.toFixed(1)} unit="%" max={100} current={output.n1} color="#3b82f6" warning={95} danger={100} isDarkMode={isDarkMode} />
        <GaugeCard label="N2" value={output.n2.toFixed(1)} unit="%" max={100} current={output.n2} color="#8b5cf6" warning={95} danger={100} isDarkMode={isDarkMode} />
        <GaugeCard label="EGT" value={output.egt.toFixed(0)} unit="°C" max={900} current={output.egt} color="#ef4444" warning={800} danger={870} isDarkMode={isDarkMode} />
        <GaugeCard label="SFC" value={output.sfc.toFixed(2)} unit="kg/kN·h" max={20} current={output.sfc} color="#06b6d4" isDarkMode={isDarkMode} />
      </div>

      {/* Additional Info */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded p-2`}>
          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Airflow: </span>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-mono`}>{output.airflow.toFixed(1)} kg/s</span>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded p-2`}>
          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>OPR: </span>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-mono`}>{output.pressureRatio.toFixed(1)}:1</span>
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
  isDarkMode: boolean;
}

function GaugeCard({ label, value, unit, max, current, color, warning, danger, isDarkMode }: GaugeCardProps) {
  const percentage = Math.min((current / max) * 100, 100);

  let barColor = color;
  if (danger && current >= danger) {
    barColor = '#ef4444';
  } else if (warning && current >= warning) {
    barColor = '#f59e0b';
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-3`}>
      <div className="flex items-baseline justify-between mb-2">
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
        <div>
          <span className={`text-lg font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ml-1`}>{unit}</span>
        </div>
      </div>

      <div className={`h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

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
