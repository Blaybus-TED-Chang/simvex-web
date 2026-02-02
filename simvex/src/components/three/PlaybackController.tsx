'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRobotStore } from '@/lib/store/robotStore';
import * as THREE from 'three';

export default function PlaybackController() {
  const {
    waypoints,
    currentWaypointIndex,
    isPlaying,
    playbackSpeed,
    loopMode,
    joints,
    setJoints,
    setCurrentWaypointIndex,
    pause,
  } = useRobotStore();

  const progressRef = useRef(0);
  const directionRef = useRef(1); // 1 for forward, -1 for backward (pingpong)

  useFrame((state, delta) => {
    if (!isPlaying || waypoints.length < 2) return;

    const fromIndex = currentWaypointIndex < 0 ? 0 : currentWaypointIndex;
    const toIndex = directionRef.current > 0 ? fromIndex + 1 : fromIndex - 1;

    // Check bounds
    if (toIndex >= waypoints.length || toIndex < 0) {
      if (loopMode === 'once') {
        pause();
        setCurrentWaypointIndex(directionRef.current > 0 ? waypoints.length - 1 : 0);
        return;
      } else if (loopMode === 'loop') {
        setCurrentWaypointIndex(0);
        progressRef.current = 0;
        return;
      } else if (loopMode === 'pingpong') {
        directionRef.current *= -1;
        return;
      }
    }

    const fromWaypoint = waypoints[fromIndex];
    const toWaypoint = waypoints[toIndex];

    if (!fromWaypoint || !toWaypoint) return;

    // Update progress
    progressRef.current += delta * playbackSpeed;

    // Easing function
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const t = Math.min(progressRef.current, 1);
    const easedT = easeInOutCubic(t);

    // Interpolate joint angles
    const newJoints = fromWaypoint.joints.map((angle, i) => {
      return THREE.MathUtils.lerp(angle, toWaypoint.joints[i], easedT);
    });

    setJoints(newJoints);

    // Move to next segment
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setCurrentWaypointIndex(toIndex);
    }
  });

  // Reset direction when playback starts
  useEffect(() => {
    if (isPlaying) {
      directionRef.current = 1;
      progressRef.current = 0;
      if (currentWaypointIndex < 0) {
        setCurrentWaypointIndex(0);
      }
    }
  }, [isPlaying, currentWaypointIndex, setCurrentWaypointIndex]);

  return null;
}
