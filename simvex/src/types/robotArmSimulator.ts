// ── Robot Arm Simulator Types & Physics ──

import { JOINT_CONFIGS, DH_PARAMS } from './robot';

// ── Types ──

export interface RobotArmParams {
  jointAngles: number[]; // 6개 관절 각도 (degrees)
  mode: 'fk' | 'ik';
  ikTarget: { x: number; y: number; z: number };
}

export interface RobotArmOutput {
  jointAngles: number[];                      // 최종 관절 각도 (degrees)
  endEffectorPos: [number, number, number];   // 엔드이펙터 XYZ 위치
  jointPositions: [number, number, number][]; // 각 관절 3D 위치 (7개: 베이스~엔드)
  isReachable: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  jointAngles: number[];
  endEffectorPos: [number, number, number];
}

export const DEFAULT_ROBOT_ARM_PARAMS: RobotArmParams = {
  jointAngles: JOINT_CONFIGS.map((j) => j.defaultAngle),
  mode: 'fk',
  ikTarget: { x: 0.5, y: 0.5, z: 0.5 },
};

// ── 4x4 Matrix helpers (row-major flat array) ──

type Mat4 = number[];

function identity4(): Mat4 {
  // prettier-ignore
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function mul4(a: Mat4, b: Mat4): Mat4 {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        r[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
      }
    }
  }
  return r;
}

function posFromMat4(m: Mat4): [number, number, number] {
  return [m[3], m[7], m[11]];
}

/** Standard DH transformation matrix */
function dhMatrix(theta: number, d: number, a: number, alpha: number): Mat4 {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const ca = Math.cos(alpha);
  const sa = Math.sin(alpha);

  // prettier-ignore
  return [
    ct, -st * ca,  st * sa, a * ct,
    st,  ct * ca, -ct * sa, a * st,
    0,   sa,       ca,      d,
    0,   0,        0,       1,
  ];
}

// ── FK Calculation ──

export function calculateFK(jointAnglesDeg: number[]): RobotArmOutput {
  const jointPositions: [number, number, number][] = [[0, 0, 0]]; // 베이스
  let T = identity4();

  for (let i = 0; i < 6; i++) {
    const thetaRad = (jointAnglesDeg[i] * Math.PI) / 180;
    const { d, a, alpha } = DH_PARAMS[i];
    T = mul4(T, dhMatrix(thetaRad, d, a, alpha));
    jointPositions.push(posFromMat4(T));
  }

  const endEffectorPos = posFromMat4(T);

  return {
    jointAngles: [...jointAnglesDeg],
    endEffectorPos,
    jointPositions,
    isReachable: true,
  };
}

// ── IK Calculation (CCD – Cyclic Coordinate Descent) ──

const IK_MAX_ITERATIONS = 50;
const IK_TOLERANCE = 0.01;

function clampAngle(angle: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, angle));
}

export function calculateIK(
  target: { x: number; y: number; z: number },
  initialAnglesDeg?: number[],
): RobotArmOutput {
  const angles = initialAnglesDeg
    ? [...initialAnglesDeg]
    : JOINT_CONFIGS.map((j) => j.defaultAngle);

  for (let iter = 0; iter < IK_MAX_ITERATIONS; iter++) {
    const fk = calculateFK(angles);
    const ee = fk.endEffectorPos;
    const dx = target.x - ee[0];
    const dy = target.y - ee[1];
    const dz = target.z - ee[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < IK_TOLERANCE) {
      return { ...fk, jointAngles: [...angles], isReachable: true };
    }

    // CCD: iterate joints from end-effector (j5) back to base (j0)
    for (let j = 5; j >= 0; j--) {
      const fkCur = calculateFK(angles);
      const jointPos = fkCur.jointPositions[j]; // joint j 위치
      const eePos = fkCur.endEffectorPos;

      // 관절→엔드이펙터 벡터
      const toEE = [eePos[0] - jointPos[0], eePos[1] - jointPos[1], eePos[2] - jointPos[2]];
      // 관절→목표 벡터
      const toTarget = [target.x - jointPos[0], target.y - jointPos[1], target.z - jointPos[2]];

      const lenEE = Math.sqrt(toEE[0] ** 2 + toEE[1] ** 2 + toEE[2] ** 2);
      const lenTarget = Math.sqrt(toTarget[0] ** 2 + toTarget[1] ** 2 + toTarget[2] ** 2);

      if (lenEE < 1e-8 || lenTarget < 1e-8) continue;

      // 관절 축 방향 (로컬)
      const axis = JOINT_CONFIGS[j].axis;

      // 축에 따라 2D 평면 투영 후 각도 계산
      let idxA: number, idxB: number;
      if (axis === 'y') {
        // y축 회전 → xz 평면
        idxA = 0;
        idxB = 2;
      } else {
        // z축 회전 → xy 평면 (로컬 근사)
        idxA = 0;
        idxB = 1;
      }

      const angle1 = Math.atan2(toEE[idxB], toEE[idxA]);
      const angle2 = Math.atan2(toTarget[idxB], toTarget[idxA]);
      let deltaAngleDeg = ((angle2 - angle1) * 180) / Math.PI;

      // 각도 변화 제한 (한 번에 너무 크게 바뀌지 않도록)
      deltaAngleDeg = Math.max(-30, Math.min(30, deltaAngleDeg));

      angles[j] += deltaAngleDeg;
      angles[j] = clampAngle(angles[j], JOINT_CONFIGS[j].min, JOINT_CONFIGS[j].max);
    }
  }

  // 수렴 실패 — 도달 불가
  const finalFK = calculateFK(angles);
  const ee = finalFK.endEffectorPos;
  const dist = Math.sqrt(
    (target.x - ee[0]) ** 2 + (target.y - ee[1]) ** 2 + (target.z - ee[2]) ** 2,
  );

  return {
    ...finalFK,
    jointAngles: [...angles],
    isReachable: dist < IK_TOLERANCE * 5,
  };
}
