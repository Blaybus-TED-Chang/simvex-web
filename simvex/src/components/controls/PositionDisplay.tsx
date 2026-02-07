'use client';

import { useRobotStore } from '@/lib/store/robotStore';

interface PositionDisplayProps {
  isDarkMode: boolean;
}

export default function PositionDisplay({ isDarkMode }: PositionDisplayProps) {
  const { endEffectorPosition } = useRobotStore();

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
        End Effector Position
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>X</span>
          <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {endEffectorPosition.x.toFixed(3)} m
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Y</span>
          <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {endEffectorPosition.y.toFixed(3)} m
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Z</span>
          <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {endEffectorPosition.z.toFixed(3)} m
          </span>
        </div>
      </div>

      <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Distance</span>
          <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
