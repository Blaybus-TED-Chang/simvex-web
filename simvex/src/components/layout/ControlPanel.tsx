'use client';

import { useRobotStore } from '@/lib/store/robotStore';
import { JOINT_CONFIGS } from '@/types/robot';
import JointSlider from '../controls/JointSlider';
import PositionDisplay from '../controls/PositionDisplay';
import TargetInput from '../controls/TargetInput';
import WaypointList from '../controls/WaypointList';

interface ControlPanelProps {
  isDarkMode: boolean;
}

export default function ControlPanel({ isDarkMode }: ControlPanelProps) {
  const { mode, setMode, resetJoints, showWorkspace, toggleWorkspace, showTrajectory, toggleTrajectory } = useRobotStore();

  return (
    <div className={`w-full h-full border-l ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} flex flex-col overflow-hidden`}>
      {/* Mode Tabs */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={() => setMode('fk')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === 'fk'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : isDarkMode
                ? 'text-gray-500 hover:text-gray-300'
                : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          FK Mode
        </button>
        <button
          onClick={() => setMode('ik')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === 'ik'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : isDarkMode
                ? 'text-gray-500 hover:text-gray-300'
                : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          IK Mode
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mode === 'fk' ? (
          <>
            {/* Joint Controls */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Joint Controls</h3>
                <button
                  onClick={resetJoints}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-3">
                {JOINT_CONFIGS.map((config, index) => (
                  <JointSlider key={config.id} index={index} config={config} isDarkMode={isDarkMode} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* IK Target Input */}
            <TargetInput isDarkMode={isDarkMode} />
          </>
        )}

        {/* Position Display */}
        <PositionDisplay isDarkMode={isDarkMode} />

        {/* View Options */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>View Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWorkspace}
                onChange={toggleWorkspace}
                className={`w-4 h-4 rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} text-blue-500 focus:ring-blue-500`}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Show Workspace</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrajectory}
                onChange={toggleTrajectory}
                className={`w-4 h-4 rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} text-blue-500 focus:ring-blue-500`}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Show Trajectory</span>
            </label>
          </div>
        </div>

        {/* Waypoints */}
        <WaypointList isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
