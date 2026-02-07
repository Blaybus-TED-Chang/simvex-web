'use client';

import { useDroneSimulatorStore } from '@/lib/store/droneSimulatorStore';
import { MOTOR_CONFIGS } from '@/types/droneSimulator';

export default function DroneControls() {
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
    <div className="w-full h-full bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Drone Controls</h2>
            <p className="text-sm text-gray-400">Quadcopter X-Configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${statusColor[output.flightStatus]}`}
            />
            <span className="text-xs text-gray-300">{statusLabel[output.flightStatus]}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Throttle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Throttle</label>
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
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${params.throttle}%, #374151 ${params.throttle}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
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
        />

        {/* Pitch */}
        <BipolarSlider
          label="Pitch"
          value={params.pitch}
          onChange={setPitch}
          leftLabel="NOSE DOWN"
          rightLabel="NOSE UP"
          color="#38bdf8"
        />

        {/* Roll */}
        <BipolarSlider
          label="Roll"
          value={params.roll}
          onChange={setRoll}
          leftLabel="LEFT"
          rightLabel="RIGHT"
          color="#fb923c"
        />

        {/* Motor RPM Gauges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Motor RPM</h3>
            <button
              onClick={toggleMotorLabels}
              className={`text-xs px-2 py-0.5 rounded ${
                showMotorLabels ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
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
                <div key={motor.id} className="bg-gray-800 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      M{motor.id} ({motor.position})
                    </span>
                    <span className="text-xs text-gray-500">
                      {motor.rotationSign > 0 ? 'CW' : 'CCW'}
                    </span>
                  </div>
                  <div className="text-base font-mono text-white">{Math.round(rpm)}</div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
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
          <h3 className="text-sm font-medium text-white mb-3">Flight Data</h3>
          <div className="grid grid-cols-2 gap-2">
            <DataCell label="Total Thrust" value={`${output.totalThrust.toFixed(1)} N`} color="text-cyan-400" />
            <DataCell label="Lift Force" value={`${output.liftForce.toFixed(1)} N`} color="text-green-400" />
            <DataCell label="Yaw Rate" value={`${output.yawRate.toFixed(1)} °/s`} color="text-purple-400" />
            <DataCell label="Power" value={`${output.powerConsumption.toFixed(0)} W`} color="text-orange-400" />
          </div>
        </div>

        {/* View Options */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Options</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRunning}
              onChange={toggleRunning}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Animation Running</span>
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
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  color: string;
}) {
  const pct = ((value + 100) / 200) * 100;
  const midPct = 50;
  const barLeft = Math.min(pct, midPct);
  const barWidth = Math.abs(pct - midPct);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-white">{label}</label>
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
            background: `linear-gradient(to right, #374151 0%, #374151 ${barLeft}%, ${color} ${barLeft}%, ${color} ${barLeft + barWidth}%, #374151 ${barLeft + barWidth}%, #374151 100%)`,
          }}
        />
        {/* Center mark */}
        <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-3 bg-gray-300 pointer-events-none" />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ── Small data display cell ──

function DataCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-800 rounded p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-base font-mono ${color}`}>{value}</div>
    </div>
  );
}
