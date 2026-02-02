'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRobotStore } from '@/lib/store/robotStore';
import { JOINT_CONFIGS } from '@/types/robot';
import { degToRad } from '@/lib/kinematics/forwardKinematics';
import * as THREE from 'three';

function Joint({
  index,
  children,
}: {
  index: number;
  children?: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { joints, activeJoint } = useRobotStore();
  const config = JOINT_CONFIGS[index];

  useFrame(() => {
    if (!groupRef.current) return;
    const angle = degToRad(joints[index]);

    if (config.axis === 'x') {
      groupRef.current.rotation.x = angle;
    } else if (config.axis === 'y') {
      groupRef.current.rotation.y = angle;
    } else {
      groupRef.current.rotation.z = angle;
    }
  });

  const isActive = activeJoint === index;

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

function Link({
  index,
  length,
  radius,
}: {
  index: number;
  length: number;
  radius: number;
}) {
  const config = JOINT_CONFIGS[index];
  const { activeJoint } = useRobotStore();
  const isActive = activeJoint === index;

  return (
    <group>
      {/* Joint sphere */}
      <mesh castShadow>
        <sphereGeometry args={[radius * 1.2, 16, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={isActive ? config.color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>

      {/* Link cylinder */}
      <mesh
        position={[0, length / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius * 0.8, radius, length, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={isActive ? config.color : '#000000'}
          emissiveIntensity={isActive ? 0.2 : 0}
        />
      </mesh>
    </group>
  );
}

function EndEffector() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setEndEffectorPosition } = useRobotStore();

  useFrame(() => {
    if (meshRef.current) {
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      setEndEffectorPosition({ x: worldPos.x, y: worldPos.y, z: worldPos.z });
    }
  });

  return (
    <group>
      {/* Gripper base */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.06]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gripper fingers */}
      <mesh position={[0, -0.03, 0.02]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.03, -0.02]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function RobotArm() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base Platform */}
      <mesh receiveShadow position={[0, -0.025, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 32]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* J1 - Base rotation */}
      <Joint index={0}>
        <Link index={0} length={0.3} radius={0.1} />

        <group position={[0, 0.3, 0]}>
          {/* J2 - Shoulder */}
          <Joint index={1}>
            <group rotation={[0, 0, Math.PI / 2]}>
              <Link index={1} length={0.5} radius={0.08} />
            </group>

            <group position={[0.5, 0, 0]}>
              {/* J3 - Elbow */}
              <Joint index={2}>
                <group rotation={[0, 0, -Math.PI / 2]}>
                  <Link index={2} length={0.4} radius={0.07} />
                </group>

                <group position={[0, 0.4, 0]}>
                  {/* J4 - Wrist 1 */}
                  <Joint index={3}>
                    <Link index={3} length={0.15} radius={0.05} />

                    <group position={[0, 0.15, 0]}>
                      {/* J5 - Wrist 2 */}
                      <Joint index={4}>
                        <Link index={4} length={0.1} radius={0.04} />

                        <group position={[0, 0.1, 0]}>
                          {/* J6 - Wrist 3 */}
                          <Joint index={5}>
                            <Link index={5} length={0.08} radius={0.035} />

                            <group position={[0, 0.08, 0]}>
                              <EndEffector />
                            </group>
                          </Joint>
                        </group>
                      </Joint>
                    </group>
                  </Joint>
                </group>
              </Joint>
            </group>
          </Joint>
        </group>
      </Joint>
    </group>
  );
}
