import { Vector3, Euler } from 'three';

export interface JointConfig {
  id: string;
  name: string;
  axis: 'x' | 'y' | 'z';
  min: number;
  max: number;
  defaultAngle: number;
  color: string;
  length: number;
  radius: number;
}

export interface JointState {
  angle: number;
  min: number;
  max: number;
  name: string;
  color: string;
}

export interface Waypoint {
  id: string;
  name: string;
  joints: number[];
  position: { x: number; y: number; z: number };
  timestamp: number;
}

export const JOINT_CONFIGS: JointConfig[] = [
  { id: 'j1', name: 'Base', axis: 'y', min: -180, max: 180, defaultAngle: 30, color: '#FF6B6B', length: 0.3, radius: 0.15 },
  { id: 'j2', name: 'Shoulder', axis: 'z', min: -90, max: 90, defaultAngle: -30, color: '#4ECDC4', length: 0.5, radius: 0.08 },
  { id: 'j3', name: 'Elbow', axis: 'z', min: -135, max: 135, defaultAngle: 60, color: '#45B7D1', length: 0.4, radius: 0.07 },
  { id: 'j4', name: 'Wrist 1', axis: 'z', min: -180, max: 180, defaultAngle: -30, color: '#96CEB4', length: 0.15, radius: 0.05 },
  { id: 'j5', name: 'Wrist 2', axis: 'y', min: -120, max: 120, defaultAngle: 0, color: '#FFEAA7', length: 0.1, radius: 0.05 },
  { id: 'j6', name: 'Wrist 3', axis: 'z', min: -360, max: 360, defaultAngle: 0, color: '#DDA0DD', length: 0.08, radius: 0.04 },
];

export const DH_PARAMS = [
  { d: 0.3, a: 0, alpha: Math.PI / 2 },
  { d: 0, a: 0.5, alpha: 0 },
  { d: 0, a: 0.4, alpha: 0 },
  { d: 0, a: 0.15, alpha: Math.PI / 2 },
  { d: 0.1, a: 0, alpha: -Math.PI / 2 },
  { d: 0.08, a: 0, alpha: 0 },
];
