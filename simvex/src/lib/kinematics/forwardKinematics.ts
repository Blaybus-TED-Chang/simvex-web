import * as THREE from 'three';
import { JOINT_CONFIGS, DH_PARAMS } from '@/types/robot';

export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

function createDHMatrix(theta: number, d: number, a: number, alpha: number): THREE.Matrix4 {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const ca = Math.cos(alpha);
  const sa = Math.sin(alpha);

  const matrix = new THREE.Matrix4();
  matrix.set(
    ct, -st * ca, st * sa, a * ct,
    st, ct * ca, -ct * sa, a * st,
    0, sa, ca, d,
    0, 0, 0, 1
  );
  return matrix;
}

export function calculateFK(jointAngles: number[]): { position: THREE.Vector3; rotation: THREE.Euler } {
  let transform = new THREE.Matrix4();
  transform.identity();

  for (let i = 0; i < jointAngles.length; i++) {
    const config = JOINT_CONFIGS[i];
    const dh = DH_PARAMS[i];
    const theta = degToRad(jointAngles[i]);

    const dhMatrix = createDHMatrix(theta, dh.d, dh.a, dh.alpha);
    transform.multiply(dhMatrix);
  }

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  transform.decompose(position, quaternion, scale);

  const rotation = new THREE.Euler().setFromQuaternion(quaternion);

  return { position, rotation };
}

export function getJointPositions(jointAngles: number[]): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
  let transform = new THREE.Matrix4();
  transform.identity();

  for (let i = 0; i < jointAngles.length; i++) {
    const dh = DH_PARAMS[i];
    const theta = degToRad(jointAngles[i]);

    const dhMatrix = createDHMatrix(theta, dh.d, dh.a, dh.alpha);
    transform.multiply(dhMatrix);

    const position = new THREE.Vector3();
    position.setFromMatrixPosition(transform);
    positions.push(position);
  }

  return positions;
}
