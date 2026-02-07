'use client';

import { useDroneSimulatorStore } from '@/lib/store/droneSimulatorStore';
import { MOTOR_CONFIGS } from '@/types/droneSimulator';

interface DroneControlsProps {
  isDarkMode: boolean;
}

export default function DroneControls({ isDarkMode }: DroneControlsProps) {
  const {
    params,
    output,
    isRunning,
    showMotorLabels,
    setThrottle,
    setYaw,
    setPitch,
    setRoll,
    toggleRunning,
    toggleMotorLabels,
    resetParams,
    setHoverPreset,
  } = useDroneSimulatorStore();

  const statusColor: Record<string, string> = {
    grounded: 'bg-gray-500',
    hovering: 'bg-green-500',
    climbing: 'bg-blue-500',
    descending: 'bg-orange-500',
  };

  const statusLabel: Record<string, string> = {
    grounded: 'Grounded',
    hovering: 'Hovering',
    climbing: 'Climbing',
    descending: 'Descending',
  };

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Drone Controls</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quadcopter X-Configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${statusColor[output.flightStatus]}`}
            />
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{statusLabel[output.flightStatus]}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Throttle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Throttle</label>
            <span className="text-lg font-mono text-green-400">{params.throttle.toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={params.throttle}
            onChange={(e) => setThrottle(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${params.throttle}%, ${isDarkMode ? '#374151' : '#d1d5db'} ${params.throttle}%, ${isDarkMode ? '#374151' : '#d1d5db'} 100%)`,
            }}
          />
          <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
            <span>OFF</span>
            <span>MAX</span>
          </div>
        </div>

        {/* Yaw */}
        <BipolarSlider
          label="Yaw"
          value={params.yaw}
          onChange={setYaw}
          leftLabel="CCW"
          rightLabel="CW"
          color="#a78bfa"
          isDarkMode={isDarkMode}
        />

        {/* Pitch */}
        <BipolarSlider
          label="Pitch"
          value={params.pitch}
          onChange={setPitch}
          leftLabel="NOSE DOWN"
          rightLabel="NOSE UP"
          color="#38bdf8"
          isDarkMode={isDarkMode}
        />

        {/* Roll */}
        <BipolarSlider
          label="Roll"
          value={params.roll}
          onChange={setRoll}
          leftLabel="LEFT"
          rightLabel="RIGHT"
          color="#fb923c"
          isDarkMode={isDarkMode}
        />

        {/* Motor RPM Gauges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Motor RPM</h3>
            <button
              onClick={toggleMotorLabels}
              className={`text-xs px-2 py-0.5 rounded ${
                showMotorLabels
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              Labels
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Layout matches physical position: top-left=M1(NW), top-right=M2(NE), etc. */}
            {[0, 1, 3, 2].map((idx) => {
              const motor = MOTOR_CONFIGS[idx];
              const rpm = output.motorRpm[idx];
              const pct = (rpm / 12000) * 100;
              return (
                <div key={motor.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      M{motor.id} ({motor.position})
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {motor.rotationSign > 0 ? 'CW' : 'CCW'}
                    </span>
                  </div>
                  <div className={`text-base font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(rpm)}</div>
                  <div className={`w-full h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full mt-1`}>
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(to right, #22c55e, ${pct > 70 ? '#f59e0b' : '#22c55e'}, ${pct > 90 ? '#ef4444' : '#22c55e'})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flight Data */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Flight Data</h3>
          <div className="grid grid-cols-2 gap-2">
            <DataCell label="Total Thrust" value={`${output.totalThrust.toFixed(1)} N`} color="text-cyan-400" isDarkMode={isDarkMode} />
            <DataCell label="Lift Force" value={`${output.liftForce.toFixed(1)} N`} color="text-green-400" isDarkMode={isDarkMode} />
            <DataCell label="Yaw Rate" value={`${output.yawRate.toFixed(1)} °/s`} color="text-purple-400" isDarkMode={isDarkMode} />
            <DataCell label="Power" value={`${output.powerConsumption.toFixed(0)} W`} color="text-orange-400" isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* View Options */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Options</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRunning}
              onChange={toggleRunning}
              className={`w-4 h-4 rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} text-blue-500 focus:ring-blue-500`}
            />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Animation Running</span>
          </label>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          <button
            onClick={setHoverPreset}
            className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
          >
            Hover Preset
          </button>
          <button
            onClick={resetParams}
            className={`flex-1 py-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} text-sm rounded-lg transition-colors`}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bipolar slider component (-100 to +100) ──

function BipolarSlider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
  color,
  isDarkMode,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  color: string;
  isDarkMode: boolean;
}) {
  const pct = ((value + 100) / 200) * 100;
  const midPct = 50;
  const barLeft = Math.min(pct, midPct);
  const barWidth = Math.abs(pct - midPct);
  const trackBg = isDarkMode ? '#374151' : '#d1d5db';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</label>
        <span className="text-sm font-mono" style={{ color }}>
          {value > 0 ? '+' : ''}{value.toFixed(0)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${trackBg} 0%, ${trackBg} ${barLeft}%, ${color} ${barLeft}%, ${color} ${barLeft + barWidth}%, ${trackBg} ${barLeft + barWidth}%, ${trackBg} 100%)`,
          }}
        />
        {/* Center mark */}
        <div className={`absolute top-0 left-1/2 -translate-x-px w-0.5 h-3 ${isDarkMode ? 'bg-gray-300' : 'bg-gray-500'} pointer-events-none`} />
      </div>
      <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ── Small data display cell ──

function DataCell({ label, value, color, isDarkMode }: { label: string; value: string; color: string; isDarkMode: boolean }) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded p-2`}>
      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
      <div className={`text-base font-mono ${color}`}>{value}</div>
    </div>
  );
}
