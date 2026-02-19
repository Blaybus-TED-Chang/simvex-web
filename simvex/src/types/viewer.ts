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

export interface PartTreeGroup {
  id: string;              // "group-{timestamp}"
  name: string;
  childPartIds: string[];
  childGroupIds: string[];      // 하위 그룹 ID (순서 보존)
  parentGroupId: string | null; // 부모 그룹 (null=최상위)
  collapsed: boolean;
}

export interface ModelViewState {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  explodeValue: number;
  selectedPartId: string | null;
  partTreeGroups?: PartTreeGroup[];
  rootName?: string;
}

// 단면도 (Cross-Section) 상태
export type CrossSectionAxis = 'x' | 'y' | 'z';

export interface CrossSectionState {
  crossSectionEnabled: boolean;
  crossSectionAxis: CrossSectionAxis;
  crossSectionOffset: number;   // 0..1 (바운딩박스 범위에 매핑)
  crossSectionFlipped: boolean;
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
  globalOpacity: number;
  modelStates: Record<string, ModelViewState>;
  showControlsGuide: boolean;
  crossSection: CrossSectionState;
  xRayMode: boolean;
  autoFocusEnabled: boolean;
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
  setGlobalOpacity: (value: number) => void;
  getModelState: (modelId: string) => ModelViewState | undefined;
  setModelState: (modelId: string, state: Partial<ModelViewState>) => void;
  createPartGroup: (modelId: string, name: string, parentGroupId?: string | null) => void;
  deletePartGroup: (modelId: string, groupId: string) => void;
  renamePartGroup: (modelId: string, groupId: string, name: string) => void;
  movePartToGroup: (modelId: string, partId: string, groupId: string | null) => void;
  toggleGroupCollapsed: (modelId: string, groupId: string) => void;
  moveGroupToGroup: (modelId: string, sourceGroupId: string, targetGroupId: string | null) => void;
  reorderGroups: (modelId: string, parentGroupId: string | null, orderedGroupIds: string[]) => void;
  toggleControlsGuide: () => void;
  setCrossSectionEnabled: (enabled: boolean) => void;
  setCrossSectionAxis: (axis: CrossSectionAxis) => void;
  setCrossSectionOffset: (offset: number) => void;
  setCrossSectionFlipped: (flipped: boolean) => void;
  resetCrossSection: () => void;
  setXRayMode: (enabled: boolean) => void;
  setAutoFocusEnabled: (enabled: boolean) => void;
}
