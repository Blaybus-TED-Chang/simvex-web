import * as THREE from 'three';
import { JOINT_CONFIGS } from '@/types/robot';
import { calculateFK, degToRad, radToDeg } from './forwardKinematics';

export interface IKResult {
  success: boolean;
  jointAngles: number[];
  iterations: number;
  error: number;
}

export function solveIK(
  target: THREE.Vector3,
  initialAngles: number[],
  options: {
    maxIterations?: number;
    tolerance?: number;
  } = {}
): IKResult {
  const { maxIterations = 100, tolerance = 0.01 } = options;

  const angles = [...initialAngles];
  let iterations = 0;
  let error = Infinity;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;

    const { position: endPos } = calculateFK(angles);
    error = endPos.distanceTo(target);

    if (error < tolerance) {
      return { success: true, jointAngles: angles, iterations, error };
    }

    // CCD: iterate from end effector to base
    for (let i = angles.length - 1; i >= 0; i--) {
      const config = JOINT_CONFIGS[i];

      // Get joint position by calculating FK up to this joint
      const partialAngles = angles.slice(0, i);
      const { position: jointPos } = i > 0
        ? calculateFK(partialAngles.concat(new Array(angles.length - i).fill(0)))
        : { position: new THREE.Vector3(0, 0, 0) };

      // Get current end effector position
      const { position: currentEnd } = calculateFK(angles);

      // Vector from joint to current end
      const toEnd = currentEnd.clone().sub(jointPos);
      // Vector from joint to target
      const toTarget = target.clone().sub(jointPos);

      if (toEnd.length() < 0.001 || toTarget.length() < 0.001) continue;

      toEnd.normalize();
      toTarget.normalize();

      // Calculate rotation angle
      let angle = Math.acos(THREE.MathUtils.clamp(toEnd.dot(toTarget), -1, 1));

      // Determine rotation direction using cross product
      const cross = new THREE.Vector3().crossVectors(toEnd, toTarget);

      // Project onto joint axis
      const axisVector = new THREE.Vector3();
      if (config.axis === 'x') axisVector.set(1, 0, 0);
      else if (config.axis === 'y') axisVector.set(0, 1, 0);
      else axisVector.set(0, 0, 1);

      const sign = cross.dot(axisVector) >= 0 ? 1 : -1;
      const deltaAngle = radToDeg(angle) * sign * 0.5; // damping factor

      // Apply angle change with limits
      angles[i] = THREE.MathUtils.clamp(
        angles[i] + deltaAngle,
        config.min,
        config.max
      );
    }
  }

  return { success: false, jointAngles: angles, iterations, error };
}

export function isReachable(target: THREE.Vector3): boolean {
  // Simple reachability check based on arm length
  const totalLength = JOINT_CONFIGS.reduce((sum, c) => sum + c.length, 0);
  const distance = target.length();

  // Add some margin for inner reach limit
  const minReach = 0.2;

  return distance <= totalLength && distance >= minReach;
}
