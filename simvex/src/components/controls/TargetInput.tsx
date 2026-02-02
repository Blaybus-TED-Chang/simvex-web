'use client';

import { useState } from 'react';
import { useRobotStore } from '@/lib/store/robotStore';
import { solveIK, isReachable } from '@/lib/kinematics/inverseKinematics';
import * as THREE from 'three';

export default function TargetInput() {
  const { targetPosition, setTargetPosition, joints, setJoints, setIsMoving } = useRobotStore();
  const [localTarget, setLocalTarget] = useState(targetPosition);

  const handleMove = () => {
    const target = new THREE.Vector3(localTarget.x, localTarget.y, localTarget.z);

    if (!isReachable(target)) {
      alert('Target position is out of reach!');
      return;
    }

    setTargetPosition(localTarget);
    setIsMoving(true);

    const result = solveIK(target, joints);
    if (result.success) {
      setJoints(result.jointAngles);
    } else {
      alert('Could not find a valid solution. Try a different position.');
    }

    setIsMoving(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Target Position
      </h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">X (meters)</label>
          <input
            type="number"
            step="0.05"
            value={localTarget.x}
            onChange={(e) => setLocalTarget({ ...localTarget, x: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Y (meters)</label>
          <input
            type="number"
            step="0.05"
            value={localTarget.y}
            onChange={(e) => setLocalTarget({ ...localTarget, y: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Z (meters)</label>
          <input
            type="number"
            step="0.05"
            value={localTarget.z}
            onChange={(e) => setLocalTarget({ ...localTarget, z: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleMove}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Move to Target
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Tip: You can also drag the target marker in the 3D view.
      </p>
    </div>
  );
}
