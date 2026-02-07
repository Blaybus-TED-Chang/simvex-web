'use client';

import { useState } from 'react';

const tabs = [
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'fk', label: 'FK' },
  { id: 'ik', label: 'IK' },
  { id: 'apps', label: 'Applications' },
];

interface LearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function LearningPanel({ isOpen, onClose, isDarkMode }: LearningPanelProps) {
  const [activeTab, setActiveTab] = useState('anatomy');

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-[420px] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl z-50 flex flex-col border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Learning</h2>
        <button
          onClick={onClose}
          className={`p-1 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded transition-colors`}
        >
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'anatomy' && <AnatomyContent isDarkMode={isDarkMode} />}
        {activeTab === 'fk' && <FKContent isDarkMode={isDarkMode} />}
        {activeTab === 'ik' && <IKContent isDarkMode={isDarkMode} />}
        {activeTab === 'apps' && <ApplicationsContent isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
}

function AnatomyContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6-Axis Robot Arm</h3>

      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        A 6-axis articulated robot is the most common type of industrial robot arm.
        It has 6 degrees of freedom (DOF), allowing it to reach any position and orientation within its workspace.
      </p>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 space-y-3`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Components</h4>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B] mt-1" />
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Base (J1)</span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Left/right rotation (Yaw)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ECDC4] mt-1" />
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shoulder (J2)</span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Forward/backward tilt (Pitch)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#45B7D1] mt-1" />
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Elbow (J3)</span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Arm bending (Pitch)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#96CEB4] mt-1" />
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wrist 1 (J4)</span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Wrist tilt (Pitch)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFEAA7] mt-1" />
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wrist 2 (J5)</span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Wrist rotation (Roll)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-[#DDA0DD] mt-1" />
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wrist 3 (J6)</span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>End effector direction (Yaw)</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>Degrees of Freedom</h4>
        <p className={isDarkMode ? 'text-blue-200/80' : 'text-blue-700/80'}>
          6 joints = 6 DOF = Full spatial control (position + orientation)
        </p>
      </div>
    </div>
  );
}

function FKContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Forward Kinematics</h3>

      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        Forward Kinematics (FK) calculates the end effector position and orientation
        from known joint angles.
      </p>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Definition</h4>
        <p className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Joint Angles → End Effector Position
        </p>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Formula</h4>
        <p className={`font-mono text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          T_total = T₁ × T₂ × T₃ × T₄ × T₅ × T₆
        </p>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Each T is a 4×4 transformation matrix containing rotation and translation.
        </p>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>DH Parameters</h4>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          Denavit-Hartenberg notation defines robot kinematics:
        </p>
        <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
          <li><strong>θ</strong> - Joint angle (rotation around z)</li>
          <li><strong>d</strong> - Link offset (translation along z)</li>
          <li><strong>a</strong> - Link length (translation along x)</li>
          <li><strong>α</strong> - Link twist (rotation around x)</li>
        </ul>
      </div>

      <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'} mb-2`}>Try It!</h4>
        <p className={isDarkMode ? 'text-green-200/80' : 'text-green-700/80'}>
          Switch to FK mode and adjust the joint sliders to see how each joint
          affects the end effector position.
        </p>
      </div>
    </div>
  );
}

function IKContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inverse Kinematics</h3>

      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        Inverse Kinematics (IK) calculates the joint angles needed to reach
        a desired end effector position.
      </p>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Definition</h4>
        <p className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Target Position → Joint Angles
        </p>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Characteristics</h4>
        <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
          <li>Inverse problem of FK</li>
          <li>Multiple solutions may exist</li>
          <li>No solution if target is unreachable</li>
          <li>Singularities require special handling</li>
        </ul>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>CCD Algorithm</h4>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          Cyclic Coordinate Descent - iterative IK solver:
        </p>
        <ol className={`list-decimal list-inside ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
          <li>Start from last joint</li>
          <li>Rotate each joint toward target</li>
          <li>Repeat from base to tip</li>
          <li>Continue until convergence</li>
        </ol>
      </div>

      <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'} mb-2`}>Try It!</h4>
        <p className={isDarkMode ? 'text-green-200/80' : 'text-green-700/80'}>
          Switch to IK mode and drag the target marker in the 3D view to see
          the robot automatically calculate joint angles.
        </p>
      </div>
    </div>
  );
}

function ApplicationsContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Applications</h3>

      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        6-axis robot arms are used in various industries for automation tasks.
      </p>

      <div className="space-y-3">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Manufacturing</h4>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Assembly, welding, painting, material handling
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Packaging</h4>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Pick and place, palletizing, labeling
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Healthcare</h4>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Surgical assistance, lab automation, pharmacy
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Research</h4>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Testing, experiments, prototyping
          </p>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} mb-2`}>Path Programming</h4>
        <p className={isDarkMode ? 'text-purple-200/80' : 'text-purple-700/80'}>
          Industrial robots are programmed with waypoints to create repeatable motion sequences.
          Try saving waypoints and playing them back!
        </p>
      </div>
    </div>
  );
}
