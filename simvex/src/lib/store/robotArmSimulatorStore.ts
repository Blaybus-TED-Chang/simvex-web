import { create } from 'zustand';
import { JOINT_CONFIGS } from '@/types/robot';
import {
  RobotArmParams,
  RobotArmOutput,
  Waypoint,
  DEFAULT_ROBOT_ARM_PARAMS,
  calculateFK,
  calculateIK,
} from '@/types/robotArmSimulator';

interface RobotArmSimulatorState {
  params: RobotArmParams;
  output: RobotArmOutput;
  isRunning: boolean;
  showLearning: boolean;
  showJointLabels: boolean;
  showWorkspace: boolean;
  waypoints: Waypoint[];
  isPlayingWaypoints: boolean;
  currentWaypointIndex: number;
  playbackSpeed: number;

  // Actions
  setJointAngle: (index: number, degrees: number) => void;
  setAllJointAngles: (angles: number[]) => void;
  setIKTarget: (x: number, y: number, z: number) => void;
  setMode: (mode: 'fk' | 'ik') => void;
  resetToDefault: () => void;
  addWaypoint: (name: string) => void;
  removeWaypoint: (id: string) => void;
  goToWaypoint: (id: string) => void;
  playWaypoints: () => void;
  stopWaypoints: () => void;
  advanceWaypoint: () => boolean; // returns true if there are more waypoints
  setPlaybackSpeed: (speed: number) => void;
  toggleRunning: () => void;
  toggleLearning: () => void;
  toggleJointLabels: () => void;
  toggleWorkspace: () => void;
}

export const useRobotArmSimulatorStore = create<RobotArmSimulatorState>((set, get) => ({
  params: { ...DEFAULT_ROBOT_ARM_PARAMS },
  output: calculateFK(DEFAULT_ROBOT_ARM_PARAMS.jointAngles),
  isRunning: true,
  showLearning: false,
  showJointLabels: true,
  showWorkspace: false,
  waypoints: [],
  isPlayingWaypoints: false,
  currentWaypointIndex: 0,
  playbackSpeed: 1,

  setJointAngle: (index, degrees) => {
    const params = { ...get().params };
    const angles = [...params.jointAngles];
    angles[index] = Math.max(
      JOINT_CONFIGS[index].min,
      Math.min(JOINT_CONFIGS[index].max, degrees),
    );
    params.jointAngles = angles;
    const output = calculateFK(angles);
    set({ params, output });
  },

  setAllJointAngles: (angles) => {
    const clamped = angles.map((a, i) =>
      Math.max(JOINT_CONFIGS[i].min, Math.min(JOINT_CONFIGS[i].max, a)),
    );
    const params = { ...get().params, jointAngles: clamped };
    const output = calculateFK(clamped);
    set({ params, output });
  },

  setIKTarget: (x, y, z) => {
    const params = { ...get().params, ikTarget: { x, y, z } };
    const result = calculateIK({ x, y, z }, get().params.jointAngles);
    params.jointAngles = result.jointAngles;
    set({ params, output: result });
  },

  setMode: (mode) => {
    set({ params: { ...get().params, mode } });
  },

  resetToDefault: () => {
    const params = { ...DEFAULT_ROBOT_ARM_PARAMS };
    set({ params, output: calculateFK(params.jointAngles) });
  },

  addWaypoint: (name) => {
    const { output, waypoints } = get();
    const wp: Waypoint = {
      id: `wp-${Date.now()}`,
      name,
      jointAngles: [...output.jointAngles],
      endEffectorPos: [...output.endEffectorPos],
    };
    set({ waypoints: [...waypoints, wp] });
  },

  removeWaypoint: (id) => {
    set({ waypoints: get().waypoints.filter((w) => w.id !== id) });
  },

  goToWaypoint: (id) => {
    const wp = get().waypoints.find((w) => w.id === id);
    if (!wp) return;
    const params = { ...get().params, jointAngles: [...wp.jointAngles] };
    set({ params, output: calculateFK(wp.jointAngles) });
  },

  playWaypoints: () => {
    if (get().waypoints.length < 2) return;
    set({ isPlayingWaypoints: true, currentWaypointIndex: 0 });
  },

  stopWaypoints: () => {
    set({ isPlayingWaypoints: false });
  },

  advanceWaypoint: () => {
    const { currentWaypointIndex, waypoints } = get();
    const nextIndex = currentWaypointIndex + 1;
    if (nextIndex >= waypoints.length) {
      set({ isPlayingWaypoints: false });
      return false;
    }
    const wp = waypoints[nextIndex];
    const params = { ...get().params, jointAngles: [...wp.jointAngles] };
    set({ params, output: calculateFK(wp.jointAngles), currentWaypointIndex: nextIndex });
    return true;
  },

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),
  toggleLearning: () => set((s) => ({ showLearning: !s.showLearning })),
  toggleJointLabels: () => set((s) => ({ showJointLabels: !s.showJointLabels })),
  toggleWorkspace: () => set((s) => ({ showWorkspace: !s.showWorkspace })),
}));
