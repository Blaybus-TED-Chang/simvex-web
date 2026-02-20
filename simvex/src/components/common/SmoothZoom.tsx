'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const _dir = new THREE.Vector3();
const _fallback = new THREE.Vector3(0, 0, 0);

interface SmoothZoomProps {
  minDist?: number;
  maxDist?: number;
}

/**
 * 부드러운 마우스 휠 줌 컴포넌트.
 * OrbitControls의 enableZoom={false}와 함께 사용.
 */
export default function SmoothZoom({ minDist = 0.3, maxDist = 30 }: SmoothZoomProps) {
  const { camera, controls } = useThree();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const velocityRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const canvas = (controls as unknown as { domElement?: HTMLCanvasElement })?.domElement
      ?? document.querySelector('canvas');
    if (!canvas) return;
    canvasRef.current = canvas;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * 0.0008;
      activeRef.current = true;
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [controls]);

  useFrame(() => {
    if (!activeRef.current) return;

    const v = velocityRef.current;
    if (Math.abs(v) < 0.0005) {
      velocityRef.current = 0;
      activeRef.current = false;
      return;
    }

    const orbitTarget = controls && 'target' in controls
      ? (controls as unknown as { target: THREE.Vector3 }).target
      : _fallback;

    _dir.subVectors(camera.position, orbitTarget);
    const dist = _dir.length();
    const move = v * (0.4 + dist * 0.25);
    const newDist = Math.max(minDist, Math.min(maxDist, dist + move));

    _dir.normalize().multiplyScalar(newDist);
    camera.position.copy(orbitTarget).add(_dir);

    velocityRef.current *= 0.75;
  });

  return null;
}
