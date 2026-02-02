import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewerState, ViewerActions } from '@/types/viewer';

const initialState: ViewerState = {
  currentModel: null,
  explodeValue: 0,
  selectedPartId: null,
  visibleParts: [],
  hoveredPartId: null,
  notes: '',
  isDarkMode: true,
};

export const useViewerStore = create<ViewerState & ViewerActions>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentModel: (modelId) =>
        set({ currentModel: modelId, selectedPartId: null, explodeValue: 0 }),

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
    }),
    {
      name: 'viewer-storage',
      partialize: (state) => ({
        notes: state.notes,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
