import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JOINT_CONFIGS, Waypoint } from '@/types/robot';
import * as THREE from 'three';

interface RobotState {
  mode: 'fk' | 'ik';
  joints: number[];
  targetPosition: { x: number; y: number; z: number };
  endEffectorPosition: { x: number; y: number; z: number };
  activeJoint: number | null;
  isMoving: boolean;
  isDarkMode: boolean;
  showLearning: boolean;
  showWorkspace: boolean;
  showTrajectory: boolean;

  // Waypoints
  waypoints: Waypoint[];
  currentWaypointIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  loopMode: 'once' | 'loop' | 'pingpong';

  // Actions
  setMode: (mode: 'fk' | 'ik') => void;
  setJointAngle: (index: number, angle: number) => void;
  setJoints: (joints: number[]) => void;
  resetJoints: () => void;
  setTargetPosition: (pos: { x: number; y: number; z: number }) => void;
  setEndEffectorPosition: (pos: { x: number; y: number; z: number }) => void;
  setActiveJoint: (index: number | null) => void;
  setIsMoving: (moving: boolean) => void;
  toggleDarkMode: () => void;
  toggleLearning: () => void;
  toggleWorkspace: () => void;
  toggleTrajectory: () => void;

  // Waypoint actions
  addWaypoint: () => void;
  removeWaypoint: (id: string) => void;
  clearWaypoints: () => void;
  goToWaypoint: (index: number) => void;
  setCurrentWaypointIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setLoopMode: (mode: 'once' | 'loop' | 'pingpong') => void;
}

const defaultJoints = JOINT_CONFIGS.map(j => j.defaultAngle);

export const useRobotStore = create<RobotState>()(
  persist(
    (set, get) => ({
      mode: 'fk',
      joints: [...defaultJoints],
      targetPosition: { x: 0.5, y: 0.5, z: 0.5 },
      endEffectorPosition: { x: 0, y: 0, z: 0 },
      activeJoint: null,
      isMoving: false,
      isDarkMode: true,
      showLearning: false,
      showWorkspace: false,
      showTrajectory: true,

      waypoints: [],
      currentWaypointIndex: -1,
      isPlaying: false,
      playbackSpeed: 1,
      loopMode: 'once',

      setMode: (mode) => set({ mode }),
      setJointAngle: (index, angle) => {
        const joints = [...get().joints];
        const config = JOINT_CONFIGS[index];
        joints[index] = Math.max(config.min, Math.min(config.max, angle));
        set({ joints });
      },
      setJoints: (joints) => set({ joints }),
      resetJoints: () => set({ joints: [...defaultJoints] }),
      setTargetPosition: (pos) => set({ targetPosition: pos }),
      setEndEffectorPosition: (pos) => set({ endEffectorPosition: pos }),
      setActiveJoint: (index) => set({ activeJoint: index }),
      setIsMoving: (moving) => set({ isMoving: moving }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleLearning: () => set((state) => ({ showLearning: !state.showLearning })),
      toggleWorkspace: () => set((state) => ({ showWorkspace: !state.showWorkspace })),
      toggleTrajectory: () => set((state) => ({ showTrajectory: !state.showTrajectory })),

      addWaypoint: () => {
        const { joints, endEffectorPosition, waypoints } = get();
        const newWaypoint: Waypoint = {
          id: `wp-${Date.now()}`,
          name: `WP${waypoints.length + 1}`,
          joints: [...joints],
          position: { ...endEffectorPosition },
          timestamp: Date.now(),
        };
        set({ waypoints: [...waypoints, newWaypoint] });
      },
      removeWaypoint: (id) => {
        set((state) => ({
          waypoints: state.waypoints.filter(w => w.id !== id),
        }));
      },
      clearWaypoints: () => set({ waypoints: [], currentWaypointIndex: -1 }),
      goToWaypoint: (index) => {
        const { waypoints } = get();
        if (index >= 0 && index < waypoints.length) {
          set({
            joints: [...waypoints[index].joints],
            currentWaypointIndex: index,
          });
        }
      },
      setCurrentWaypointIndex: (index) => set({ currentWaypointIndex: index }),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      stop: () => set({ isPlaying: false, currentWaypointIndex: -1 }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      setLoopMode: (mode) => set({ loopMode: mode }),
    }),
    {
      name: 'simvex-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        waypoints: state.waypoints,
      }),
    }
  )
);
