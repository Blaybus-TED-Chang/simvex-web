'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useDroneSimulatorStore } from '@/lib/store/droneSimulatorStore';
import { MOTOR_CONFIGS } from '@/types/droneSimulator';
import { droneCombinedModel } from '@/data/models/droneCombined';

interface ExtractedMesh {
  name: string;
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  color: string;
  isBlade: boolean;
  bladeIndex: number; // -1 if not a blade
}

export default function DroneSimModel() {
  const { scene } = useGLTF('/models/drone-combined/drone-combined.glb');
  const { output, isRunning } = useDroneSimulatorStore();

  const bodyGroupRef = useRef<THREE.Group>(null);
  const bladeRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);

  // Build color map from config
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const part of droneCombinedModel.parts) {
      if (part.color) map.set(part.meshName, part.color);
    }
    return map;
  }, []);

  // Build blade mesh name set for quick lookup
  const bladeMap = useMemo(() => {
    const map = new Map<string, number>();
    MOTOR_CONFIGS.forEach((motor, idx) => {
      map.set(motor.meshName, idx);
    });
    return map;
  }, []);

  // Extract meshes from scene (same pattern as CombinedGLBPart)
  const [meshes, setMeshes] = useState<ExtractedMesh[]>([]);

  useEffect(() => {
    scene.updateMatrixWorld(true);
    const extracted: ExtractedMesh[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        child.getWorldPosition(worldPosition);
        child.getWorldQuaternion(worldQuaternion);
        child.getWorldScale(worldScale);

        const bladeIndex = bladeMap.get(child.name) ?? -1;

        extracted.push({
          name: child.name,
          geometry: child.geometry,
          position: worldPosition.clone(),
          quaternion: worldQuaternion.clone(),
          scale: worldScale.clone(),
          color: colorMap.get(child.name) || '#888888',
          isBlade: bladeIndex >= 0,
          bladeIndex,
        });
      }
    });

    setMeshes(extracted);
  }, [scene, colorMap, bladeMap]);

  // Animate blades + body tilt every frame
  useFrame((_state, delta) => {
    if (!isRunning) return;

    const VISUAL_RPM_SCALE = 0.004;
    MOTOR_CONFIGS.forEach((motor, idx) => {
      const blade = bladeRefs.current[idx];
      if (!blade) return;
      const rpm = output.motorRpm[idx];
      const speed = rpm * VISUAL_RPM_SCALE * motor.rotationSign;
      blade.rotation.y += speed * delta;
    });

    if (bodyGroupRef.current) {
      const lerpFactor = 1 - Math.pow(0.05, delta);
      bodyGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.x,
        output.bodyPitch,
        lerpFactor,
      );
      bodyGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.z,
        -output.bodyRoll,
        lerpFactor,
      );
    }
  });

  return (
    <group ref={bodyGroupRef}>
      {meshes.map((m, i) => (
        <mesh
          key={`${m.name}-${i}`}
          ref={(el) => {
            if (m.isBlade) bladeRefs.current[m.bladeIndex] = el;
          }}
          geometry={m.geometry}
          position={[m.position.x, m.position.y, m.position.z]}
          quaternion={[m.quaternion.x, m.quaternion.y, m.quaternion.z, m.quaternion.w]}
          scale={[m.scale.x, m.scale.y, m.scale.z]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={m.color} metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
