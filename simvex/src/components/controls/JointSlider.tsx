'use client';

import { useRobotStore } from '@/lib/store/robotStore';
import { JointConfig } from '@/types/robot';

interface JointSliderProps {
  index: number;
  config: JointConfig;
}

export default function JointSlider({ index, config }: JointSliderProps) {
  const { joints, setJointAngle, activeJoint, setActiveJoint } = useRobotStore();
  const angle = joints[index];

  const percentage = ((angle - config.min) / (config.max - config.min)) * 100;
  const isNearLimit = percentage < 10 || percentage > 90;
  const isAtLimit = percentage <= 0 || percentage >= 100;

  return (
    <div
      className={`p-3 rounded-lg transition-colors ${
        activeJoint === index ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
      onMouseEnter={() => setActiveJoint(index)}
      onMouseLeave={() => setActiveJoint(null)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            J{index + 1} ({config.name})
          </span>
        </div>
        <span
          className={`text-sm font-mono ${
            isAtLimit
              ? 'text-red-500'
              : isNearLimit
              ? 'text-orange-500'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {angle.toFixed(1)}°
        </span>
      </div>

      <input
        type="range"
        min={config.min}
        max={config.max}
        step={0.5}
        value={angle}
        onChange={(e) => setJointAngle(index, parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${config.color} 0%, ${config.color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
      />

      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{config.min}°</span>
        <span className="text-xs text-gray-400">{config.max}°</span>
      </div>
    </div>
  );
}
