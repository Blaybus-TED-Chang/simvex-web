'use client';

import { useRobotStore } from '@/lib/store/robotStore';
import { JOINT_CONFIGS } from '@/types/robot';
import JointSlider from '../controls/JointSlider';
import PositionDisplay from '../controls/PositionDisplay';
import TargetInput from '../controls/TargetInput';
import WaypointList from '../controls/WaypointList';

export default function ControlPanel() {
  const { mode, setMode, resetJoints, showWorkspace, toggleWorkspace, showTrajectory, toggleTrajectory } = useRobotStore();

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setMode('fk')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === 'fk'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          FK Mode
        </button>
        <button
          onClick={() => setMode('ik')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === 'ik'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
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
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Joint Controls</h3>
                <button
                  onClick={resetJoints}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-3">
                {JOINT_CONFIGS.map((config, index) => (
                  <JointSlider key={config.id} index={index} config={config} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* IK Target Input */}
            <TargetInput />
          </>
        )}

        {/* Position Display */}
        <PositionDisplay />

        {/* View Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">View Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWorkspace}
                onChange={toggleWorkspace}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Show Workspace</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrajectory}
                onChange={toggleTrajectory}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Show Trajectory</span>
            </label>
          </div>
        </div>

        {/* Waypoints */}
        <WaypointList />
      </div>
    </div>
  );
}
