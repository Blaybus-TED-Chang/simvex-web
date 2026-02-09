import { create } from 'zustand';

interface PendingAnnotation {
  position: [number, number, number];
  targetType: 'part' | 'coordinate';
  partId?: string;
}

interface DragTargetInfo {
  targetType: 'part' | 'coordinate';
  partId?: string;
}

interface AnnotationStoreState {
  isPlacingPin: boolean;
  isAnnotationPanelOpen: boolean;
  activeAnnotationId: string | null;
  pendingAnnotation: PendingAnnotation | null;
  showAllAnnotations: boolean;
  // 드래그 이동 상태
  draggingAnnotationId: string | null;
  dragPreviewPosition: [number, number, number] | null;
  dragTargetInfo: DragTargetInfo | null;
}

interface AnnotationStoreActions {
  setPlacingPin: (placing: boolean) => void;
  setAnnotationPanelOpen: (open: boolean) => void;
  setActiveAnnotationId: (id: string | null) => void;
  setPendingAnnotation: (pending: PendingAnnotation | null) => void;
  setShowAllAnnotations: (show: boolean) => void;
  // 드래그 이동 액션
  setDraggingAnnotation: (id: string | null) => void;
  setDragPreview: (pos: [number, number, number] | null, info?: DragTargetInfo | null) => void;
  clearDrag: () => void;
  reset: () => void;
}

const initialState: AnnotationStoreState = {
  isPlacingPin: false,
  isAnnotationPanelOpen: false,
  activeAnnotationId: null,
  pendingAnnotation: null,
  showAllAnnotations: false,
  draggingAnnotationId: null,
  dragPreviewPosition: null,
  dragTargetInfo: null,
};

export const useAnnotationStore = create<AnnotationStoreState & AnnotationStoreActions>()(
  (set) => ({
    ...initialState,
    setPlacingPin: (placing) => set({ isPlacingPin: placing }),
    setAnnotationPanelOpen: (open) => set({ isAnnotationPanelOpen: open }),
    setActiveAnnotationId: (id) => set({ activeAnnotationId: id }),
    setPendingAnnotation: (pending) => set({ pendingAnnotation: pending }),
    setShowAllAnnotations: (show) => set({ showAllAnnotations: show }),
    setDraggingAnnotation: (id) => set({ draggingAnnotationId: id }),
    setDragPreview: (pos, info) => set({ dragPreviewPosition: pos, dragTargetInfo: info ?? null }),
    clearDrag: () => set({ draggingAnnotationId: null, dragPreviewPosition: null, dragTargetInfo: null }),
    reset: () => set(initialState),
  })
);
