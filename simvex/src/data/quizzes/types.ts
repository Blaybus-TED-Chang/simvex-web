// 퀴즈 문제 유형
export type QuestionType = 'multiple-choice' | 'true-false' | 'identify-part';

// 개별 문제
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];           // 객관식용
  correctAnswer: string | number;
  partId?: string;              // 부품 클릭 문제용
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 모델별 퀴즈
export interface ModelQuiz {
  modelId: string;
  titleKo: string;
  description: string;
  questions: QuizQuestion[];
}

// 퀴즈 진행 상태
export interface QuizProgress {
  currentIndex: number;
  answers: Record<string, string | number>;
  correctAnswers: Record<string, boolean>; // 문제별 정답 여부
  score: number;
  completed: boolean;
  startedAt: number;
  completedAt?: number;
  selectedQuestionIds: string[]; // 랜덤 선택된 문제 ID 목록
}
