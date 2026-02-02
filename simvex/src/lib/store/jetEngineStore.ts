import { create } from 'zustand';
import { EngineParams, EngineOutput, DEFAULT_ENGINE_PARAMS, calculateEngineOutput } from '@/types/jetEngine';

export type AirflowMode = 'particles' | 'streamlines' | 'both';

interface JetEngineState {
  params: EngineParams;
  output: EngineOutput;
  isRunning: boolean;
  selectedSection: string | null;
  showParticles: boolean;
  showCutaway: boolean;
  particleSpeed: number;
  airflowMode: AirflowMode;

  // Actions
  setThrottle: (value: number) => void;
  setAltitude: (value: number) => void;
  setMachNumber: (value: number) => void;
  setBypassRatio: (value: number) => void;
  setSelectedSection: (section: string | null) => void;
  toggleParticles: () => void;
  toggleCutaway: () => void;
  setAirflowMode: (mode: AirflowMode) => void;
  startEngine: () => void;
  stopEngine: () => void;
  resetParams: () => void;
}

export const useJetEngineStore = create<JetEngineState>((set, get) => ({
  params: { ...DEFAULT_ENGINE_PARAMS },
  output: calculateEngineOutput(DEFAULT_ENGINE_PARAMS),
  isRunning: true,
  selectedSection: null,
  showParticles: true,
  showCutaway: true,
  particleSpeed: 1,
  airflowMode: 'both' as AirflowMode,

  setThrottle: (value) => {
    const params = { ...get().params, throttle: value };
    set({ params, output: calculateEngineOutput(params) });
  },

  setAltitude: (value) => {
    const params = { ...get().params, altitude: value };
    set({ params, output: calculateEngineOutput(params) });
  },

  setMachNumber: (value) => {
    const params = { ...get().params, machNumber: value };
    set({ params, output: calculateEngineOutput(params) });
  },

  setBypassRatio: (value) => {
    const params = { ...get().params, bypassRatio: value };
    set({ params, output: calculateEngineOutput(params) });
  },

  setSelectedSection: (section) => set({ selectedSection: section }),

  toggleParticles: () => set((state) => ({ showParticles: !state.showParticles })),

  toggleCutaway: () => set((state) => ({ showCutaway: !state.showCutaway })),

  setAirflowMode: (mode) => set({ airflowMode: mode }),

  startEngine: () => set({ isRunning: true }),

  stopEngine: () => set({ isRunning: false }),

  resetParams: () => {
    set({
      params: { ...DEFAULT_ENGINE_PARAMS },
      output: calculateEngineOutput(DEFAULT_ENGINE_PARAMS),
    });
  },
}));
