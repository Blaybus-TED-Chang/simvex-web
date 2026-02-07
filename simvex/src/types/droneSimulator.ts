// ── Drone Simulator Types & Physics ──

export interface DroneParams {
  throttle: number;   // 0–100  전체 모터 출력
  yaw: number;        // -100–+100  CW/CCW 차동
  pitch: number;      // -100–+100  전/후 기울기
  roll: number;       // -100–+100  좌/우 기울기
}

export interface DroneOutput {
  motorRpm: [number, number, number, number];  // M1 M2 M3 M4
  totalThrust: number;       // N
  liftForce: number;         // N (기울기 반영 수직 성분)
  bodyPitch: number;         // rad
  bodyRoll: number;          // rad
  yawRate: number;           // deg/s
  powerConsumption: number;  // W
  flightStatus: 'grounded' | 'hovering' | 'climbing' | 'descending';
}

/**
 * Motor layout (X-configuration quadcopter, top view):
 *
 *   M1 (NW, CW)     M2 (NE, CCW)
 *        \             /
 *         \           /
 *          [ FRAME ]
 *         /           \
 *        /             \
 *   M4 (SW, CCW)    M3 (SE, CW)
 */
export interface MotorConfig {
  id: number;
  meshName: string;
  position: string;          // NW | NE | SE | SW
  rotationSign: 1 | -1;     // +1 = CW, -1 = CCW
}

export const MOTOR_CONFIGS: MotorConfig[] = [
  { id: 1, meshName: 'Blade_1', position: 'NW', rotationSign: +1 },
  { id: 2, meshName: 'Blade_2', position: 'NE', rotationSign: -1 },
  { id: 3, meshName: 'Blade_3', position: 'SE', rotationSign: +1 },
  { id: 4, meshName: 'Blade_4', position: 'SW', rotationSign: -1 },
];

export const DEFAULT_DRONE_PARAMS: DroneParams = {
  throttle: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
};

// ── Physics Constants ──

const MAX_RPM = 12000;
const MAX_TILT_RAD = (30 * Math.PI) / 180;    // 30 degrees
const DRONE_WEIGHT_N = 15;                      // ~1.5 kg drone weight
const THRUST_PER_RPM = 0.0015;                 // N per RPM per motor
const POWER_PER_RPM = 0.005;                    // W per RPM per motor
const MAX_YAW_RATE = 200;                       // deg/s at full differential

// ── Motor Mixing Matrix ──
// Each row: [throttle, pitch, roll, yaw] coefficients for that motor
//           M1(NW,CW)  M2(NE,CCW)  M3(SE,CW)  M4(SW,CCW)
const MIXING: [number, number, number, number][] = [
  [+1, -1, +1, +1],   // M1: throttle, -pitch, +roll, +yaw
  [+1, -1, -1, -1],   // M2: throttle, -pitch, -roll, -yaw
  [+1, +1, -1, +1],   // M3: throttle, +pitch, -roll, +yaw
  [+1, +1, +1, -1],   // M4: throttle, +pitch, +roll, -yaw
];

export function calculateDroneOutput(params: DroneParams): DroneOutput {
  const { throttle, yaw, pitch, roll } = params;

  const base = (throttle / 100) * MAX_RPM;
  const pitchDelta = (pitch / 100) * MAX_RPM * 0.25;
  const rollDelta = (roll / 100) * MAX_RPM * 0.25;
  const yawDelta = (yaw / 100) * MAX_RPM * 0.15;

  const motorRpm = MIXING.map((mix) => {
    const rpm =
      base * mix[0] +
      pitchDelta * mix[1] +
      rollDelta * mix[2] +
      yawDelta * mix[3];
    return Math.max(0, Math.min(MAX_RPM, rpm));
  }) as [number, number, number, number];

  const totalThrust = motorRpm.reduce((sum, rpm) => sum + rpm * THRUST_PER_RPM, 0);

  const bodyPitch = (pitch / 100) * MAX_TILT_RAD;
  const bodyRoll = (roll / 100) * MAX_TILT_RAD;

  const tiltAngle = Math.sqrt(bodyPitch * bodyPitch + bodyRoll * bodyRoll);
  const liftForce = totalThrust * Math.cos(tiltAngle);

  const yawRate = (yaw / 100) * MAX_YAW_RATE * (throttle / 100);

  const powerConsumption = motorRpm.reduce((sum, rpm) => sum + rpm * POWER_PER_RPM, 0);

  let flightStatus: DroneOutput['flightStatus'];
  if (throttle === 0) {
    flightStatus = 'grounded';
  } else if (liftForce > DRONE_WEIGHT_N * 1.05) {
    flightStatus = 'climbing';
  } else if (liftForce < DRONE_WEIGHT_N * 0.95) {
    flightStatus = 'descending';
  } else {
    flightStatus = 'hovering';
  }

  return {
    motorRpm,
    totalThrust,
    liftForce,
    bodyPitch,
    bodyRoll,
    yawRate,
    powerConsumption,
    flightStatus,
  };
}
