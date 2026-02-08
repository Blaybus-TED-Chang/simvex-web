import { create } from 'zustand';

interface PendingAnnotation {
  position: [number, number, number];
  targetType: 'part' | 'coordinate';
  partId?: string;
}

interface AnnotationStoreState {
  isPlacingPin: boolean;
  isAnnotationPanelOpen: boolean;
  activeAnnotationId: string | null;
  pendingAnnotation: PendingAnnotation | null;
  showAllAnnotations: boolean;
}

interface AnnotationStoreActions {
  setPlacingPin: (placing: boolean) => void;
  setAnnotationPanelOpen: (open: boolean) => void;
  setActiveAnnotationId: (id: string | null) => void;
  setPendingAnnotation: (pending: PendingAnnotation | null) => void;
  setShowAllAnnotations: (show: boolean) => void;
  reset: () => void;
}

const initialState: AnnotationStoreState = {
  isPlacingPin: false,
  isAnnotationPanelOpen: false,
  activeAnnotationId: null,
  pendingAnnotation: null,
  showAllAnnotations: false,
};

export const useAnnotationStore = create<AnnotationStoreState & AnnotationStoreActions>()(
  (set) => ({
    ...initialState,
    setPlacingPin: (placing) => set({ isPlacingPin: placing }),
    setAnnotationPanelOpen: (open) => set({ isAnnotationPanelOpen: open }),
    setActiveAnnotationId: (id) => set({ activeAnnotationId: id }),
    setPendingAnnotation: (pending) => set({ pendingAnnotation: pending }),
    setShowAllAnnotations: (show) => set({ showAllAnnotations: show }),
    reset: () => set(initialState),
  })
);
