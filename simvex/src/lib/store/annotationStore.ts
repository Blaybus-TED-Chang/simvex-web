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
}

interface AnnotationStoreActions {
  setPlacingPin: (placing: boolean) => void;
  setAnnotationPanelOpen: (open: boolean) => void;
  setActiveAnnotationId: (id: string | null) => void;
  setPendingAnnotation: (pending: PendingAnnotation | null) => void;
  reset: () => void;
}

const initialState: AnnotationStoreState = {
  isPlacingPin: false,
  isAnnotationPanelOpen: false,
  activeAnnotationId: null,
  pendingAnnotation: null,
};

export const useAnnotationStore = create<AnnotationStoreState & AnnotationStoreActions>()(
  (set) => ({
    ...initialState,
    setPlacingPin: (placing) => set({ isPlacingPin: placing }),
    setAnnotationPanelOpen: (open) => set({ isAnnotationPanelOpen: open }),
    setActiveAnnotationId: (id) => set({ activeAnnotationId: id }),
    setPendingAnnotation: (pending) => set({ pendingAnnotation: pending }),
    reset: () => set(initialState),
  })
);
