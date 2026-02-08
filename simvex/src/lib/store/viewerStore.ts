import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewerState, ViewerActions, ModelViewState } from '@/types/viewer';

const initialState: ViewerState = {
  currentModel: null,
  explodeValue: 0,
  selectedPartId: null,
  visibleParts: [],
  hoveredPartId: null,
  notes: '',
  isDarkMode: false,
  globalOpacity: 1,
  modelStates: {},
};

export const useViewerStore = create<ViewerState & ViewerActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentModel: (modelId) =>
        set((state) => ({
          currentModel: modelId,
          selectedPartId: null,
          // 같은 모델이면 저장된 explodeValue 유지
          ...(state.currentModel !== modelId ? { explodeValue: 0 } : {}),
        })),

      setExplodeValue: (value) =>
        set({ explodeValue: Math.max(0, Math.min(1, value)) }),

      setSelectedPartId: (partId) =>
        set({ selectedPartId: partId }),

      togglePartVisibility: (partId) =>
        set((state) => ({
          visibleParts: state.visibleParts.includes(partId)
            ? state.visibleParts.filter((id) => id !== partId)
            : [...state.visibleParts, partId],
        })),

      setAllPartsVisible: (partIds) =>
        set({ visibleParts: partIds }),

      setHoveredPartId: (partId) =>
        set({ hoveredPartId: partId }),

      setNotes: (notes) =>
        set({ notes }),

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),

      resetViewer: () =>
        set({
          explodeValue: 0,
          selectedPartId: null,
          hoveredPartId: null,
        }),

      setGlobalOpacity: (value) =>
        set({ globalOpacity: Math.max(0, Math.min(1, value)) }),

      getModelState: (modelId: string) => {
        return get().modelStates[modelId];
      },

      setModelState: (modelId: string, state: Partial<ModelViewState>) =>
        set((prev) => ({
          modelStates: {
            ...prev.modelStates,
            [modelId]: {
              ...prev.modelStates[modelId],
              ...state,
            } as ModelViewState,
          },
        })),
    }),
    {
      name: 'viewer-storage',
      partialize: (state) => ({
        notes: state.notes,
        isDarkMode: state.isDarkMode,
        explodeValue: state.explodeValue,
        currentModel: state.currentModel,
        globalOpacity: state.globalOpacity,
        modelStates: state.modelStates,
      }),
      skipHydration: true,
    }
  )
);
