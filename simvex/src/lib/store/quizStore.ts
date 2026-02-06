import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizProgress, QuizQuestion } from '@/data/quizzes/types';

interface QuizState {
  // 모델별 퀴즈 진행 상태
  quizProgress: Record<string, QuizProgress>;
  // 현재 활성화된 퀴즈 모델 ID
  activeQuizModelId: string | null;
}

// Fisher-Yates 셔플 알고리즘
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface QuizActions {
  startQuiz: (modelId: string, questionIds: string[], selectCount?: number) => void;
  answerQuestion: (
    modelId: string,
    questionId: string,
    answer: string | number,
    isCorrect: boolean
  ) => void;
  nextQuestion: (modelId: string) => void;
  prevQuestion: (modelId: string) => void;
  goToQuestion: (modelId: string, index: number) => void;
  completeQuiz: (modelId: string) => void;
  resetQuiz: (modelId: string) => void;
  setActiveQuiz: (modelId: string | null) => void;
  getProgress: (modelId: string) => QuizProgress | undefined;
}

const initialState: QuizState = {
  quizProgress: {},
  activeQuizModelId: null,
};

export const useQuizStore = create<QuizState & QuizActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startQuiz: (modelId: string, questionIds: string[], selectCount: number = 10) => {
        // 문제를 랜덤으로 섞고 selectCount개 선택
        const shuffled = shuffleArray(questionIds);
        const selected = shuffled.slice(0, Math.min(selectCount, shuffled.length));

        set((state) => ({
          quizProgress: {
            ...state.quizProgress,
            [modelId]: {
              currentIndex: 0,
              answers: {},
              score: 0,
              completed: false,
              startedAt: Date.now(),
              selectedQuestionIds: selected,
            },
          },
          activeQuizModelId: modelId,
        }));
      },

      answerQuestion: (
        modelId: string,
        questionId: string,
        answer: string | number,
        isCorrect: boolean
      ) =>
        set((state) => {
          const progress = state.quizProgress[modelId];
          if (!progress) return state;

          return {
            quizProgress: {
              ...state.quizProgress,
              [modelId]: {
                ...progress,
                answers: {
                  ...progress.answers,
                  [questionId]: answer,
                },
                score: isCorrect ? progress.score + 1 : progress.score,
              },
            },
          };
        }),

      nextQuestion: (modelId: string) =>
        set((state) => {
          const progress = state.quizProgress[modelId];
          if (!progress) return state;

          return {
            quizProgress: {
              ...state.quizProgress,
              [modelId]: {
                ...progress,
                currentIndex: progress.currentIndex + 1,
              },
            },
          };
        }),

      prevQuestion: (modelId: string) =>
        set((state) => {
          const progress = state.quizProgress[modelId];
          if (!progress || progress.currentIndex <= 0) return state;

          return {
            quizProgress: {
              ...state.quizProgress,
              [modelId]: {
                ...progress,
                currentIndex: progress.currentIndex - 1,
              },
            },
          };
        }),

      goToQuestion: (modelId: string, index: number) =>
        set((state) => {
          const progress = state.quizProgress[modelId];
          if (!progress || index < 0) return state;

          return {
            quizProgress: {
              ...state.quizProgress,
              [modelId]: {
                ...progress,
                currentIndex: index,
              },
            },
          };
        }),

      completeQuiz: (modelId: string) =>
        set((state) => {
          const progress = state.quizProgress[modelId];
          if (!progress) return state;

          return {
            quizProgress: {
              ...state.quizProgress,
              [modelId]: {
                ...progress,
                completed: true,
                completedAt: Date.now(),
              },
            },
          };
        }),

      resetQuiz: (modelId: string) =>
        set((state) => {
          const { [modelId]: _, ...rest } = state.quizProgress;
          return {
            quizProgress: rest,
            activeQuizModelId:
              state.activeQuizModelId === modelId
                ? null
                : state.activeQuizModelId,
          };
        }),

      setActiveQuiz: (modelId: string | null) =>
        set({ activeQuizModelId: modelId }),

      getProgress: (modelId: string) => {
        return get().quizProgress[modelId];
      },
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        quizProgress: state.quizProgress,
      }),
      skipHydration: true,
    }
  )
);
