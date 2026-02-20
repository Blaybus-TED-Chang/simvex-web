import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GuideTour } from '@/types/guideTour';

interface GuideTourState {
  // 모델별 투어 캐시
  tourCache: Record<string, GuideTour>;
  // 활성 투어
  activeTour: GuideTour | null;
  currentStep: number;
  isAutoPlaying: boolean;
  autoPlaySpeed: number; // 초 단위 (기본 5초)
}

interface GuideTourActions {
  cacheTour: (modelId: string, tour: GuideTour) => void;
  getCachedTour: (modelId: string) => GuideTour | undefined;
  startTour: (tour: GuideTour) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  toggleAutoPlay: () => void;
  setAutoPlaySpeed: (speed: number) => void;
}

const initialState: GuideTourState = {
  tourCache: {},
  activeTour: null,
  currentStep: 0,
  isAutoPlaying: false,
  autoPlaySpeed: 5,
};

export const useGuideTourStore = create<GuideTourState & GuideTourActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      cacheTour: (modelId, tour) =>
        set((state) => ({
          tourCache: { ...state.tourCache, [modelId]: tour },
        })),

      getCachedTour: (modelId) => get().tourCache[modelId],

      startTour: (tour) =>
        set({
          activeTour: tour,
          currentStep: 0,
          isAutoPlaying: false,
        }),

      stopTour: () =>
        set({
          activeTour: null,
          currentStep: 0,
          isAutoPlaying: false,
        }),

      nextStep: () =>
        set((state) => {
          if (!state.activeTour) return state;
          const maxStep = state.activeTour.steps.length - 1;
          if (state.currentStep >= maxStep) {
            return { isAutoPlaying: false };
          }
          return { currentStep: state.currentStep + 1 };
        }),

      prevStep: () =>
        set((state) => {
          if (!state.activeTour || state.currentStep <= 0) return state;
          return { currentStep: state.currentStep - 1 };
        }),

      goToStep: (index) =>
        set((state) => {
          if (!state.activeTour) return state;
          const maxStep = state.activeTour.steps.length - 1;
          return { currentStep: Math.max(0, Math.min(index, maxStep)) };
        }),

      toggleAutoPlay: () =>
        set((state) => ({ isAutoPlaying: !state.isAutoPlaying })),

      setAutoPlaySpeed: (speed) =>
        set({ autoPlaySpeed: Math.max(2, Math.min(15, speed)) }),
    }),
    {
      name: 'guide-tour-storage',
      partialize: (state) => ({
        tourCache: state.tourCache,
        autoPlaySpeed: state.autoPlaySpeed,
      }),
      skipHydration: true,
    },
  ),
);
