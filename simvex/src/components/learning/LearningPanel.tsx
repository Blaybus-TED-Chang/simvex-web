'use client';

import { useState } from 'react';
import { useRobotStore } from '@/lib/store/robotStore';

const tabs = [
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'fk', label: 'FK' },
  { id: 'ik', label: 'IK' },
  { id: 'apps', label: 'Applications' },
];

export default function LearningPanel() {
  const { showLearning, toggleLearning } = useRobotStore();
  const [activeTab, setActiveTab] = useState('anatomy');

  if (!showLearning) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning</h2>
        <button
          onClick={toggleLearning}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'anatomy' && <AnatomyContent />}
        {activeTab === 'fk' && <FKContent />}
        {activeTab === 'ik' && <IKContent />}
        {activeTab === 'apps' && <ApplicationsContent />}
      </div>
    </div>
  );
}

function AnatomyContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">6-Axis Robot Arm</h3>

      <p className="text-gray-600 dark:text-gray-400">
        A 6-axis articulated robot is the most common type of industrial robot arm.
        It has 6 degrees of freedom (DOF), allowing it to reach any position and orientation within its workspace.
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Components</h4>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B] mt-1" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Base (J1)</span>
              <p className="text-gray-500 dark:text-gray-400">Left/right rotation (Yaw)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ECDC4] mt-1" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Shoulder (J2)</span>
              <p className="text-gray-500 dark:text-gray-400">Forward/backward tilt (Pitch)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#45B7D1] mt-1" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Elbow (J3)</span>
              <p className="text-gray-500 dark:text-gray-400">Arm bending (Pitch)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#96CEB4] mt-1" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Wrist 1 (J4)</span>
              <p className="text-gray-500 dark:text-gray-400">Wrist tilt (Pitch)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFEAA7] mt-1" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Wrist 2 (J5)</span>
              <p className="text-gray-500 dark:text-gray-400">Wrist rotation (Roll)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#DDA0DD] mt-1" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Wrist 3 (J6)</span>
              <p className="text-gray-500 dark:text-gray-400">End effector direction (Yaw)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Degrees of Freedom</h4>
        <p className="text-blue-800 dark:text-blue-200">
          6 joints = 6 DOF = Full spatial control (position + orientation)
        </p>
      </div>
    </div>
  );
}

function FKContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forward Kinematics</h3>

      <p className="text-gray-600 dark:text-gray-400">
        Forward Kinematics (FK) calculates the end effector position and orientation
        from known joint angles.
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Definition</h4>
        <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
          Joint Angles → End Effector Position
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Formula</h4>
        <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
          T_total = T₁ × T₂ × T₃ × T₄ × T₅ × T₆
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Each T is a 4×4 transformation matrix containing rotation and translation.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">DH Parameters</h4>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Denavit-Hartenberg notation defines robot kinematics:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>θ</strong> - Joint angle (rotation around z)</li>
          <li><strong>d</strong> - Link offset (translation along z)</li>
          <li><strong>a</strong> - Link length (translation along x)</li>
          <li><strong>α</strong> - Link twist (rotation around x)</li>
        </ul>
      </div>

      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
        <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Try It!</h4>
        <p className="text-green-800 dark:text-green-200">
          Switch to FK mode and adjust the joint sliders to see how each joint
          affects the end effector position.
        </p>
      </div>
    </div>
  );
}

function IKContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inverse Kinematics</h3>

      <p className="text-gray-600 dark:text-gray-400">
        Inverse Kinematics (IK) calculates the joint angles needed to reach
        a desired end effector position.
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Definition</h4>
        <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
          Target Position → Joint Angles
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Characteristics</h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>Inverse problem of FK</li>
          <li>Multiple solutions may exist</li>
          <li>No solution if target is unreachable</li>
          <li>Singularities require special handling</li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">CCD Algorithm</h4>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Cyclic Coordinate Descent - iterative IK solver:
        </p>
        <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>Start from last joint</li>
          <li>Rotate each joint toward target</li>
          <li>Repeat from base to tip</li>
          <li>Continue until convergence</li>
        </ol>
      </div>

      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
        <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Try It!</h4>
        <p className="text-green-800 dark:text-green-200">
          Switch to IK mode and drag the target marker in the 3D view to see
          the robot automatically calculate joint angles.
        </p>
      </div>
    </div>
  );
}

function ApplicationsContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applications</h3>

      <p className="text-gray-600 dark:text-gray-400">
        6-axis robot arms are used in various industries for automation tasks.
      </p>

      <div className="space-y-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Manufacturing</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Assembly, welding, painting, material handling
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Packaging</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Pick and place, palletizing, labeling
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Healthcare</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Surgical assistance, lab automation, pharmacy
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Research</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Testing, experiments, prototyping
          </p>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Path Programming</h4>
        <p className="text-purple-800 dark:text-purple-200">
          Industrial robots are programmed with waypoints to create repeatable motion sequences.
          Try saving waypoints and playing them back!
        </p>
      </div>
    </div>
  );
}
