// 개별 부품 정보
export interface PartConfig {
  id: string;
  glbFile: string;
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  assemblyPosition: [number, number, number];
  assemblyRotation?: [number, number, number];
  explodeDirection: [number, number, number];
  explodeDistance: number;
  color?: string;
}

// 제품(모델) 정보
export interface ModelConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
  thumbnail: string;
  thumbnails?: string[];
  basePath: string;
  parts: PartConfig[];
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
}

// 모델별 뷰 상태 (저장용)
export interface ModelViewState {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  explodeValue: number;
  selectedPartId: string | null;
}

// 뷰어 상태
export interface ViewerState {
  currentModel: string | null;
  explodeValue: number;
  selectedPartId: string | null;
  visibleParts: string[];
  hoveredPartId: string | null;
  notes: string;
  isDarkMode: boolean;
  modelStates: Record<string, ModelViewState>;
}

// 뷰어 액션
export interface ViewerActions {
  setCurrentModel: (modelId: string | null) => void;
  setExplodeValue: (value: number) => void;
  setSelectedPartId: (partId: string | null) => void;
  togglePartVisibility: (partId: string) => void;
  setAllPartsVisible: (partIds: string[]) => void;
  setHoveredPartId: (partId: string | null) => void;
  setNotes: (notes: string) => void;
  toggleDarkMode: () => void;
  resetViewer: () => void;
  getModelState: (modelId: string) => ModelViewState | undefined;
  setModelState: (modelId: string, state: Partial<ModelViewState>) => void;
}
