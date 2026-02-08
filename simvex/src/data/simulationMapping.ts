/**
 * 모델 ID ↔ 시뮬레이션 매핑
 */

export interface SimulationMapping {
  /** 시뮬레이션 식별자 */
  simulationId: string;
  /** 시뮬레이션 한국어 이름 */
  nameKo: string;
  /** 3D 부품 뷰어가 존재하는지 (모델 설정이 있는지) */
  hasViewer: boolean;
}

const SIMULATION_MAP: Record<string, SimulationMapping> = {
  'drone-combined': {
    simulationId: 'drone',
    nameKo: '드론 시뮬레이터',
    hasViewer: true,
  },
  'robot-arm-combined': {
    simulationId: 'robot-arm',
    nameKo: '로봇 암 시뮬레이터',
    hasViewer: true,
  },
  'jet-engine': {
    simulationId: 'jet-engine',
    nameKo: '터보팬 엔진 시뮬레이터',
    hasViewer: false,
  },
};

/** 모델 ID에 대한 시뮬레이션 매핑을 반환 (없으면 undefined) */
export function getSimulationMapping(modelId: string): SimulationMapping | undefined {
  return SIMULATION_MAP[modelId];
}

/** 모델 ID에 시뮬레이션이 있는지 */
export function hasSimulation(modelId: string): boolean {
  return modelId in SIMULATION_MAP;
}

/** 모델 ID에 3D 부품 뷰어가 있는지 */
export function hasViewer(modelId: string): boolean {
  const mapping = SIMULATION_MAP[modelId];
  // 매핑이 없으면 일반 모델이므로 뷰어가 있다고 판단
  if (!mapping) return true;
  return mapping.hasViewer;
}
