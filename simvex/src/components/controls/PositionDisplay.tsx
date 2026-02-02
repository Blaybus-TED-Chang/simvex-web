'use client';

import { useRobotStore } from '@/lib/store/robotStore';

export default function PositionDisplay() {
  const { endEffectorPosition } = useRobotStore();

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        End Effector Position
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">X</span>
          <span className="font-mono text-sm text-gray-900 dark:text-white">
            {endEffectorPosition.x.toFixed(3)} m
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Y</span>
          <span className="font-mono text-sm text-gray-900 dark:text-white">
            {endEffectorPosition.y.toFixed(3)} m
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Z</span>
          <span className="font-mono text-sm text-gray-900 dark:text-white">
            {endEffectorPosition.z.toFixed(3)} m
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Distance</span>
          <span className="font-mono text-sm text-gray-900 dark:text-white">
            {Math.sqrt(
              endEffectorPosition.x ** 2 +
              endEffectorPosition.y ** 2 +
              endEffectorPosition.z ** 2
            ).toFixed(3)} m
          </span>
        </div>
      </div>
    </div>
  );
}
