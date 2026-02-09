/**
 * [보류] 로봇 암 시뮬레이션 — 제어 패널 (ON/OFF, 속도, 관절각 표시)
 * 현재 미사용. RobotArmSimModel.tsx 상단 주석 참고.
 */
'use client';

import { robotArmCombinedModel } from '@/data/models/robotArmCombined';

const JOINT_NAMES = ['J1 Base', 'J2 Shoulder', 'J3 Elbow', 'J4 Wrist Pitch', 'J5 Wrist Roll'];

interface RobotArmSimControlsProps {
  isDarkMode: boolean;
  isRunning: boolean;
  speed: number;
  jointAngles: number[];
  onToggleRunning: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function RobotArmSimControls({
  isDarkMode,
  isRunning,
  speed,
  jointAngles,
  onToggleRunning,
  onSpeedChange,
}: RobotArmSimControlsProps) {
  const speedPct = Math.round(speed * 100);

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Robot Arm Controls</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>6-Axis Industrial Robot</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ON/OFF Toggle */}
        <div>
          <button
            onClick={onToggleRunning}
            className={`w-full py-3 rounded-lg text-white font-semibold text-base transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isRunning ? 'STOP' : 'START'}
          </button>
        </div>

        {/* Speed Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Speed</label>
            <span className="text-sm font-mono text-blue-400">{speedPct}%</span>
          </div>
          <input
            type="range"
            min={25}
            max={200}
            step={25}
            value={speedPct}
            onChange={(e) => onSpeedChange(parseInt(e.target.value) / 100)}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((speedPct - 25) / 175) * 100}%, ${isDarkMode ? '#374151' : '#d1d5db'} ${((speedPct - 25) / 175) * 100}%, ${isDarkMode ? '#374151' : '#d1d5db'} 100%)`,
            }}
          />
          <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
            <span>0.25x</span>
            <span>1x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Joint Angles (read-only) */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Joint Angles</h3>
          <div className="space-y-2">
            {JOINT_NAMES.map((name, idx) => {
              const angle = jointAngles[idx] ?? 0;
              return (
                <div key={name} className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg px-3 py-2`}>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{name}</span>
                  <span className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {angle >= 0 ? '+' : ''}{angle.toFixed(1)}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parts List */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Parts ({robotArmCombinedModel.parts.length})</h3>
          <div className="space-y-1">
            {robotArmCombinedModel.parts.map((part) => (
              <div key={part.id} className={`flex items-center gap-2 px-3 py-1.5 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: part.color || '#888888' }}
                />
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{part.nameKo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
