'use client';

import { useState } from 'react';
import { ENGINE_SECTIONS } from '@/types/jetEngine';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Components' },
  { id: 'physics', label: 'Physics' },
];

interface EngineLearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EngineLearningPanel({ isOpen, onClose }: EngineLearningPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Turbofan Engine</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'components' && <ComponentsContent />}
        {activeTab === 'physics' && <PhysicsContent />}
      </div>
    </div>
  );
}

function OverviewContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-white">How a Turbofan Engine Works</h3>

      <p className="text-gray-400 leading-relaxed">
        A turbofan engine is the most common type of jet engine used in commercial aviation.
        It combines a ducted fan with a turbojet core to provide high efficiency at subsonic speeds.
      </p>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">The Brayton Cycle</h4>
        <ol className="space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-mono">1.</span>
            <span><strong className="text-blue-400">Intake</strong> - Air enters the engine</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">2.</span>
            <span><strong className="text-cyan-400">Compression</strong> - Fan and compressors increase pressure</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 font-mono">3.</span>
            <span><strong className="text-orange-400">Combustion</strong> - Fuel burns, heating the air</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-mono">4.</span>
            <span><strong className="text-red-400">Expansion</strong> - Hot gas spins the turbines</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 font-mono">5.</span>
            <span><strong className="text-pink-400">Exhaust</strong> - High-speed gas exits, producing thrust</span>
          </li>
        </ol>
      </div>

      <div className="bg-blue-900/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-300 mb-2">Bypass Ratio</h4>
        <p className="text-blue-200/80">
          Modern turbofans have high bypass ratios (8:1 to 12:1), meaning most air goes around
          the core. This improves fuel efficiency and reduces noise.
        </p>
      </div>

      <div className="bg-green-900/30 rounded-lg p-4">
        <h4 className="font-medium text-green-300 mb-2">Try It!</h4>
        <p className="text-green-200/80">
          Adjust the throttle and watch how the engine parameters change.
          Click on engine sections to learn more about each component.
        </p>
      </div>
    </div>
  );
}

function ComponentsContent() {
  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Engine Components</h3>

      {ENGINE_SECTIONS.map(section => (
        <div key={section.id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: section.color }}
            />
            <h4 className="font-medium text-white">{section.name}</h4>
          </div>
          <p className="text-gray-400">{getComponentDescription(section.id)}</p>
        </div>
      ))}
    </div>
  );
}

function getComponentDescription(id: string): string {
  const descriptions: Record<string, string> = {
    inlet: 'Captures incoming air and directs it into the engine. Designed to slow the air from flight speed to a manageable velocity.',
    fan: 'Large rotating blades at the front. Accelerates air into both the core and bypass duct. Driven by the low-pressure turbine.',
    lpc: 'First compression stage. Increases air pressure by 3-4x before passing to the high-pressure compressor.',
    hpc: 'Multiple stages of rotating and stationary blades. Compresses air to 30-40x atmospheric pressure.',
    combustor: 'Fuel is injected and burned continuously. Temperatures reach 1500-2000°C. Most critical component for efficiency.',
    hpt: 'Extracts energy from hot gas to drive the high-pressure compressor. Operates in extreme temperatures.',
    lpt: 'Larger turbine that drives the fan and low-pressure compressor. Extracts remaining energy from the exhaust.',
    nozzle: 'Accelerates the exhaust gases to produce thrust. Shape affects efficiency and noise levels.',
  };
  return descriptions[id] || 'Component description not available.';
}

function PhysicsContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-white">Engine Physics</h3>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Thrust Equation</h4>
        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-300">
          F = ṁ × (V_exit - V_inlet)
        </div>
        <p className="text-gray-400 mt-2">
          Thrust equals mass flow rate times the change in velocity.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Specific Fuel Consumption</h4>
        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-300">
          SFC = Fuel Flow / Thrust
        </div>
        <p className="text-gray-400 mt-2">
          Lower SFC means better fuel efficiency. Typical values: 0.3-0.6 kg/(kN·h)
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Pressure Ratio</h4>
        <p className="text-gray-400">
          Overall Pressure Ratio (OPR) is the ratio of combustor pressure to inlet pressure.
          Higher OPR generally means higher thermal efficiency. Modern engines achieve 40:1 or higher.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Altitude Effects</h4>
        <p className="text-gray-400">
          At higher altitudes, air density decreases exponentially. This reduces both thrust
          and fuel flow, but SFC improves due to lower temperatures.
        </p>
      </div>

      <div className="bg-purple-900/30 rounded-lg p-4">
        <h4 className="font-medium text-purple-300 mb-2">Key Relationships</h4>
        <ul className="text-purple-200/80 space-y-1">
          <li>• Throttle ↑ → N1, N2, Thrust, Fuel Flow ↑</li>
          <li>• Altitude ↑ → Thrust, Fuel Flow ↓, SFC ↓</li>
          <li>• Mach ↑ → Ram pressure ↑, Thrust ↑</li>
        </ul>
      </div>
    </div>
  );
}
