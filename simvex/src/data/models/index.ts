import { ModelConfig } from '@/types/viewer';
import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';
import { suspensionModel } from './suspension';
import { droneModel } from './drone';
import { v4EngineModel } from './v4engine';
import { robotArmModel } from './robotArm';
import { robotGripperModel } from './robotGripper';
import { leafSpringModel } from './leafSpring';
import { machineViceModel } from './machineVice';
import { droneCombinedModel } from './droneCombined';
import { robotArmCombinedModel } from './robotArmCombined';
import { leafSpringCombinedModel } from './leafSpringCombined';

// 개별 GLB 모델 목록
export const models: ModelConfig[] = [
  suspensionModel,
  droneModel,
  v4EngineModel,
  robotArmModel,
  robotGripperModel,
  leafSpringModel,
  machineViceModel,
];

// 통합 GLB 모델 목록
export const combinedModels: CombinedModelConfig[] = [
  droneCombinedModel,
  robotArmCombinedModel,
  leafSpringCombinedModel,
];

// ID로 개별 모델 찾기
export function getModelById(id: string): ModelConfig | undefined {
  return models.find((model) => model.id === id);
}

// ID로 통합 모델 찾기
export function getCombinedModelById(id: string): CombinedModelConfig | undefined {
  return combinedModels.find((model) => model.id === id);
}

// 카테고리별 모델 필터링
export function getModelsByCategory(category: string): ModelConfig[] {
  return models.filter((model) => model.category === category);
}

// 모든 카테고리 목록
export function getAllCategories(): string[] {
  const allModels = [...models, ...combinedModels];
  return [...new Set(allModels.map((model) => model.category))];
}
