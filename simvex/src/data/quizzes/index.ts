import { ModelQuiz } from './types';
import { droneCombinedQuiz } from './drone-combined';
import { robotArmCombinedQuiz } from './robot-arm-combined';
import { leafSpringCombinedQuiz } from './leaf-spring-combined';

// 모델별 퀴즈 맵
export const quizzes: Record<string, ModelQuiz> = {
  'drone-combined': droneCombinedQuiz,
  'robot-arm-combined': robotArmCombinedQuiz,
  'leaf-spring-combined': leafSpringCombinedQuiz,
};

// 모델 ID로 퀴즈 가져오기
export function getQuizByModelId(modelId: string): ModelQuiz | undefined {
  return quizzes[modelId];
}

// 퀴즈가 있는 모델인지 확인
export function hasQuiz(modelId: string): boolean {
  return modelId in quizzes;
}

export * from './types';
