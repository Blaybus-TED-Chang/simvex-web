/**
 * 시뮬레이션별 모델 정보 (PDF/노트/헤더에 사용)
 */

import { MOTOR_CONFIGS } from '@/types/droneSimulator';
import { ENGINE_SECTIONS } from '@/types/jetEngine';
import { JOINT_CONFIGS } from '@/types/robot';

interface SimModelInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
  parts: { id: string; nameKo: string; name: string; description: string }[];
}

const DRONE_SIM_MODEL_INFO: SimModelInfo = {
  id: 'drone-simulator',
  name: 'Drone Simulator',
  nameKo: '드론 시뮬레이터',
  description: '쿼드콥터 비행 시뮬레이터 — 4개의 모터 RPM을 조절하여 추력, 요, 피치, 롤 제어를 체험합니다.',
  theory: '쿼드콥터는 4개의 로터를 사용하여 양력, 방향, 기울기를 제어하는 멀티로터 항공기입니다. 각 로터의 속도 조합으로 Throttle(상승/하강), Yaw(수평 회전), Pitch(전진/후진), Roll(좌우 이동)을 제어합니다.',
  category: '항공',
  parts: [
    ...MOTOR_CONFIGS.map((m) => ({
      id: `motor-${m.id}`,
      nameKo: `모터 M${m.id} (${m.position})`,
      name: `Motor M${m.id} (${m.position})`,
      description: `${m.position} 위치의 BLDC 모터. ${m.rotationSign > 0 ? '시계 방향(CW)' : '반시계 방향(CCW)'} 회전.`,
    })),
    {
      id: 'main-frame',
      nameKo: '메인 프레임',
      name: 'Main Frame',
      description: '카본 파이버 재질의 X자형 중앙 구조물. 모터, ESC, FC, 배터리 등 전자부품이 장착됩니다.',
    },
  ],
};

const ROBOT_ARM_SIM_MODEL_INFO: SimModelInfo = {
  id: 'robot-arm-simulator',
  name: 'Robot Arm Simulator',
  nameKo: '로봇 팔 시뮬레이터',
  description: '6축 산업용 로봇 팔 시뮬레이터 — FK/IK 모드로 관절을 제어하고 웨이포인트를 프로그래밍합니다.',
  theory: '6축 로봇 팔은 6개의 자유도(DOF)를 가진 관절형 로봇으로, 정기구학(FK)과 역기구학(IK)을 통해 작업공간 내 모든 위치와 방향에 도달할 수 있습니다.',
  category: '로봇',
  parts: JOINT_CONFIGS.map((j) => ({
    id: j.id,
    nameKo: `${j.name} (${j.id.toUpperCase()})`,
    name: `${j.name} (${j.id.toUpperCase()})`,
    description: `${j.axis.toUpperCase()}축 회전, 범위: ${j.min}° ~ ${j.max}°`,
  })),
};

const JET_ENGINE_SIM_MODEL_INFO: SimModelInfo = {
  id: 'jet-engine-simulator',
  name: 'Turbofan Engine Simulator',
  nameKo: '터보팬 엔진 시뮬레이터',
  description: 'CFM56급 터보팬 엔진 시뮬레이터 — 스로틀, 고도, 마하수를 조절하여 엔진 성능 변화를 체험합니다.',
  theory: '터보팬 엔진은 흡입-압축-연소-팽창-배기의 브레이튼 사이클로 작동합니다. 높은 바이패스비로 연료 효율과 소음을 개선합니다.',
  category: '항공',
  parts: ENGINE_SECTIONS.map((s) => ({
    id: s.name,
    nameKo: s.name,
    name: s.name,
    description: s.description,
  })),
};

const SIM_MODEL_INFO_MAP: Record<string, SimModelInfo> = {
  'drone-combined': DRONE_SIM_MODEL_INFO,
  'robot-arm-combined': ROBOT_ARM_SIM_MODEL_INFO,
  'jet-engine': JET_ENGINE_SIM_MODEL_INFO,
};

/** 모델 ID에 대한 시뮬레이션 모델 정보를 반환 (없으면 undefined) */
export function getSimulationModelInfo(modelId: string): SimModelInfo | undefined {
  return SIM_MODEL_INFO_MAP[modelId];
}
