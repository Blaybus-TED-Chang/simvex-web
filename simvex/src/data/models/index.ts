import { ModelConfig } from '@/types/viewer';
import { suspensionModel } from './suspension';
import { droneModel } from './drone';
import { v4EngineModel } from './v4engine';
import { robotArmModel } from './robotArm';
import { robotGripperModel } from './robotGripper';
import { leafSpringModel } from './leafSpring';
import { machineViceModel } from './machineVice';

// 모든 모델 목록
export const models: ModelConfig[] = [
  suspensionModel,
  droneModel,
  v4EngineModel,
  robotArmModel,
  robotGripperModel,
  leafSpringModel,
  machineViceModel,
];

// ID로 모델 찾기
export function getModelById(id: string): ModelConfig | undefined {
  return models.find((model) => model.id === id);
}

// 카테고리별 모델 필터링
export function getModelsByCategory(category: string): ModelConfig[] {
  return models.filter((model) => model.category === category);
}

// 모든 카테고리 목록
export function getAllCategories(): string[] {
  return [...new Set(models.map((model) => model.category))];
}
