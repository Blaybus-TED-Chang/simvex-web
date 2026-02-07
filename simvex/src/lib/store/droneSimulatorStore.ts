import { create } from 'zustand';
import {
  DroneParams,
  DroneOutput,
  DEFAULT_DRONE_PARAMS,
  calculateDroneOutput,
} from '@/types/droneSimulator';

interface DroneSimulatorState {
  params: DroneParams;
  output: DroneOutput;
  isRunning: boolean;
  showLearning: boolean;
  showMotorLabels: boolean;

  // Actions
  setThrottle: (value: number) => void;
  setYaw: (value: number) => void;
  setPitch: (value: number) => void;
  setRoll: (value: number) => void;
  toggleRunning: () => void;
  toggleLearning: () => void;
  toggleMotorLabels: () => void;
  resetParams: () => void;
  setHoverPreset: () => void;
}

export const useDroneSimulatorStore = create<DroneSimulatorState>((set, get) => ({
  params: { ...DEFAULT_DRONE_PARAMS },
  output: calculateDroneOutput(DEFAULT_DRONE_PARAMS),
  isRunning: true,
  showLearning: false,
  showMotorLabels: true,

  setThrottle: (value) => {
    const params = { ...get().params, throttle: value };
    set({ params, output: calculateDroneOutput(params) });
  },

  setYaw: (value) => {
    const params = { ...get().params, yaw: value };
    set({ params, output: calculateDroneOutput(params) });
  },

  setPitch: (value) => {
    const params = { ...get().params, pitch: value };
    set({ params, output: calculateDroneOutput(params) });
  },

  setRoll: (value) => {
    const params = { ...get().params, roll: value };
    set({ params, output: calculateDroneOutput(params) });
  },

  toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),
  toggleLearning: () => set((s) => ({ showLearning: !s.showLearning })),
  toggleMotorLabels: () => set((s) => ({ showMotorLabels: !s.showMotorLabels })),

  resetParams: () => {
    set({
      params: { ...DEFAULT_DRONE_PARAMS },
      output: calculateDroneOutput(DEFAULT_DRONE_PARAMS),
    });
  },

  setHoverPreset: () => {
    const params: DroneParams = { throttle: 50, yaw: 0, pitch: 0, roll: 0 };
    set({ params, output: calculateDroneOutput(params) });
  },
}));
