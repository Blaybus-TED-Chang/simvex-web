'use client';

import { useJetEngineStore, AirflowMode } from '@/lib/store/jetEngineStore';
import { ENGINE_SECTIONS, getSectionProperties } from '@/types/jetEngine';
import EngineGauges from './EngineGauges';

export default function EngineControls() {
  const {
    params,
    output,
    selectedSection,
    showParticles,
    showCutaway,
    airflowMode,
    setThrottle,
    setAltitude,
    setMachNumber,
    toggleParticles,
    toggleCutaway,
    setAirflowMode,
    resetParams,
  } = useJetEngineStore();

  const selectedSectionData = selectedSection
    ? ENGINE_SECTIONS.find(s => s.id === selectedSection)
    : null;

  const sectionProps = selectedSection
    ? getSectionProperties(selectedSection, params.throttle)
    : null;

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Engine Controls</h2>
        <p className="text-sm text-gray-400">CFM56-class Turbofan</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Throttle Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Throttle</label>
            <span className="text-lg font-mono text-green-400">{params.throttle.toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={params.throttle}
            onChange={(e) => setThrottle(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${params.throttle}%, #374151 ${params.throttle}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>IDLE</span>
            <span>TOGA</span>
          </div>
        </div>

        {/* Altitude */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Altitude</label>
            <span className="text-sm font-mono text-blue-400">{params.altitude.toLocaleString()} ft</span>
          </div>
          <input
            type="range"
            min={0}
            max={45000}
            step={1000}
            value={params.altitude}
            onChange={(e) => setAltitude(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Mach Number */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Mach Number</label>
            <span className="text-sm font-mono text-purple-400">M {params.machNumber.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.01}
            value={params.machNumber}
            onChange={(e) => setMachNumber(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Engine Gauges */}
        <EngineGauges />

        {/* View Options */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">View Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showParticles}
                onChange={toggleParticles}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Show Airflow</span>
            </label>

            {/* Airflow Mode Selection */}
            {showParticles && (
              <div className="ml-6 space-y-1">
                <span className="text-xs text-gray-500">Airflow Style</span>
                <div className="flex gap-1">
                  {[
                    { value: 'particles', label: 'Particles' },
                    { value: 'streamlines', label: 'Lines' },
                    { value: 'both', label: 'Both' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAirflowMode(option.value as AirflowMode)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        airflowMode === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCutaway}
                onChange={toggleCutaway}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Cutaway View</span>
            </label>
          </div>
        </div>

        {/* Selected Section Info */}
        {selectedSectionData && sectionProps && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedSectionData.color }}
              />
              {selectedSectionData.name}
            </h3>
            <p className="text-xs text-gray-400 mb-3">{selectedSectionData.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded p-2">
                <div className="text-xs text-gray-500">Temperature</div>
                <div className="text-lg font-mono text-orange-400">
                  {sectionProps.temperature.toFixed(0)}°C
                </div>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <div className="text-xs text-gray-500">Pressure</div>
                <div className="text-lg font-mono text-cyan-400">
                  {sectionProps.pressure.toFixed(1)} bar
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={resetParams}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
