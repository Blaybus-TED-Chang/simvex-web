'use client';

import { useState } from 'react';
import { useRobotArmSimulatorStore } from '@/lib/store/robotArmSimulatorStore';
import { JOINT_CONFIGS } from '@/types/robot';
import { InlineTooltip } from '@/components/ui/Tooltip';

interface RobotArmControlsProps {
  isDarkMode: boolean;
}

type Tab = 'fk' | 'ik' | 'waypoints';

export default function RobotArmControls({ isDarkMode }: RobotArmControlsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('fk');
  const {
    params,
    output,
    isRunning,
    showJointLabels,
    showWorkspace,
    waypoints,
    isPlayingWaypoints,
    playbackSpeed,
    setJointAngle,
    setIKTarget,
    setMode,
    resetToDefault,
    addWaypoint,
    removeWaypoint,
    goToWaypoint,
    playWaypoints,
    stopWaypoints,
    setPlaybackSpeed,
    toggleRunning,
    toggleJointLabels,
    toggleWorkspace,
  } = useRobotArmSimulatorStore();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMode(tab === 'ik' ? 'ik' : 'fk');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'fk', label: '관절 제어 (FK)' },
    { id: 'ik', label: '역기구학 (IK)' },
    { id: 'waypoints', label: '웨이포인트' },
  ];

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Robot Arm Controls</h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>6-DOF Articulated Robot</p>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : isDarkMode
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'fk' && (
          <FKTab
            jointAngles={params.jointAngles}
            onJointChange={setJointAngle}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'ik' && (
          <IKTab
            ikTarget={params.ikTarget}
            isReachable={output.isReachable}
            onSetTarget={setIKTarget}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'waypoints' && (
          <WaypointsTab
            waypoints={waypoints}
            isPlaying={isPlayingWaypoints}
            playbackSpeed={playbackSpeed}
            onAdd={addWaypoint}
            onRemove={removeWaypoint}
            onGoTo={goToWaypoint}
            onPlay={playWaypoints}
            onStop={stopWaypoints}
            onSpeedChange={setPlaybackSpeed}
            isDarkMode={isDarkMode}
          />
        )}

        {/* End Effector Position */}
        <div>
          <InlineTooltip label="FK/IK 결과로 계산된 엔드이펙터 위치">
            <h3 className={`text-sm font-medium cursor-help ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>End Effector Position</h3>
          </InlineTooltip>
          <div className="grid grid-cols-3 gap-2">
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <div key={axis} className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded p-2 text-center`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{axis}</div>
                <div className={`text-sm font-mono ${
                  axis === 'X' ? 'text-red-400' : axis === 'Y' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {output.endEffectorPos[i].toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRunning}
                onChange={toggleRunning}
                className={`w-4 h-4 rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} text-blue-500 focus:ring-blue-500`}
              />
              <InlineTooltip label="관절 회전 애니메이션 보간(lerp) 활성화">
                <span className={`text-sm cursor-help ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Animation Running</span>
              </InlineTooltip>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showJointLabels}
                onChange={toggleJointLabels}
                className={`w-4 h-4 rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} text-blue-500 focus:ring-blue-500`}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Joint Labels</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWorkspace}
                onChange={toggleWorkspace}
                className={`w-4 h-4 rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} text-blue-500 focus:ring-blue-500`}
              />
              <InlineTooltip label="로봇팔이 도달 가능한 작업 공간 반투명 구체 표시">
                <span className={`text-sm cursor-help ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Workspace Sphere</span>
              </InlineTooltip>
            </label>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={resetToDefault}
          className={`w-full py-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} text-sm rounded-lg transition-colors`}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}

// ── FK Tab ──

function FKTab({
  jointAngles,
  onJointChange,
  isDarkMode,
}: {
  jointAngles: number[];
  onJointChange: (index: number, degrees: number) => void;
  isDarkMode: boolean;
}) {
  return (
    <div className="space-y-3">
      {JOINT_CONFIGS.map((joint, i) => {
        const angle = jointAngles[i];
        const range = joint.max - joint.min;
        const pct = ((angle - joint.min) / range) * 100;
        const trackBg = isDarkMode ? '#374151' : '#d1d5db';

        return (
          <div key={joint.id}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: joint.color }} />
                <InlineTooltip label={`${joint.name} 관절 (${joint.axis}축 회전, ${joint.min}°~${joint.max}°)`}>
                  <label className={`text-sm font-medium cursor-help ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    J{i + 1}: {joint.name}
                  </label>
                </InlineTooltip>
              </div>
              <span className="text-sm font-mono" style={{ color: joint.color }}>
                {angle.toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              min={joint.min}
              max={joint.max}
              step={0.5}
              value={angle}
              onChange={(e) => onJointChange(i, parseFloat(e.target.value))}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${joint.color} 0%, ${joint.color} ${pct}%, ${trackBg} ${pct}%, ${trackBg} 100%)`,
              }}
            />
            <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              <span>{joint.min}°</span>
              <span>{joint.max}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── IK Tab ──

function IKTab({
  ikTarget,
  isReachable,
  onSetTarget,
  isDarkMode,
}: {
  ikTarget: { x: number; y: number; z: number };
  isReachable: boolean;
  onSetTarget: (x: number, y: number, z: number) => void;
  isDarkMode: boolean;
}) {
  const [localX, setLocalX] = useState(ikTarget.x.toString());
  const [localY, setLocalY] = useState(ikTarget.y.toString());
  const [localZ, setLocalZ] = useState(ikTarget.z.toString());

  const handleSubmit = () => {
    const x = parseFloat(localX) || 0;
    const y = parseFloat(localY) || 0;
    const z = parseFloat(localZ) || 0;
    onSetTarget(x, y, z);
  };

  const inputClass = `w-full px-3 py-2 text-sm font-mono rounded-lg border ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  } focus:outline-none focus:ring-1 focus:ring-blue-500`;

  return (
    <div className="space-y-4">
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        목표 XYZ 좌표를 입력하면 CCD 알고리즘으로 관절 각도를 자동 계산합니다.
      </p>

      <div className="space-y-3">
        {[
          { label: 'X', value: localX, setter: setLocalX, color: 'text-red-400' },
          { label: 'Y', value: localY, setter: setLocalY, color: 'text-green-400' },
          { label: 'Z', value: localZ, setter: setLocalZ, color: 'text-blue-400' },
        ].map(({ label, value, setter, color }) => (
          <div key={label}>
            <label className={`text-sm font-medium ${color} mb-1 block`}>{label} 좌표</label>
            <input
              type="number"
              step={0.05}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        IK 계산 및 이동
      </button>

      {/* Reachability indicator */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isReachable
          ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
          : isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
      }`}>
        <div className={`w-2.5 h-2.5 rounded-full ${isReachable ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-sm ${
          isReachable
            ? isDarkMode ? 'text-green-300' : 'text-green-700'
            : isDarkMode ? 'text-red-300' : 'text-red-700'
        }`}>
          {isReachable ? '도달 가능' : '도달 불가 — 가장 가까운 위치로 이동됨'}
        </span>
      </div>
    </div>
  );
}

// ── Waypoints Tab ──

function WaypointsTab({
  waypoints,
  isPlaying,
  playbackSpeed,
  onAdd,
  onRemove,
  onGoTo,
  onPlay,
  onStop,
  onSpeedChange,
  isDarkMode,
}: {
  waypoints: { id: string; name: string; endEffectorPos: [number, number, number] }[];
  isPlaying: boolean;
  playbackSpeed: number;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onGoTo: (id: string) => void;
  onPlay: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  isDarkMode: boolean;
}) {
  const handleAdd = () => {
    onAdd(`WP ${waypoints.length + 1}`);
  };

  return (
    <div className="space-y-4">
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        현재 관절 상태를 웨이포인트로 저장하고, 순차 재생할 수 있습니다.
      </p>

      <button
        onClick={handleAdd}
        className="w-full py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
      >
        + 현재 위치 저장
      </button>

      {/* Waypoint List */}
      {waypoints.length === 0 ? (
        <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          저장된 웨이포인트가 없습니다
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {waypoints.map((wp, i) => (
            <div
              key={wp.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <span className={`text-xs font-mono w-5 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {i + 1}
              </span>
              <button
                onClick={() => onGoTo(wp.id)}
                className={`flex-1 text-left text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
              >
                <div className="font-medium">{wp.name}</div>
                <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({wp.endEffectorPos.map((v) => v.toFixed(2)).join(', ')})
                </div>
              </button>
              <button
                onClick={() => onRemove(wp.id)}
                className={`text-xs p-1 rounded ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-500 hover:bg-gray-200'} transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Playback Controls */}
      {waypoints.length >= 2 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {isPlaying ? (
              <button
                onClick={onStop}
                className="flex-1 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                Play
              </button>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Speed</span>
              <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{playbackSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.1}
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: isDarkMode ? '#374151' : '#d1d5db',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
