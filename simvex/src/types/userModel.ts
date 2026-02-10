import type { CombinedPartConfig, CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';

// 카테고리 상수
export const MODEL_CATEGORIES = [
  '자동차',
  '로봇',
  '항공',
  '기계',
  '전자',
  '기타',
] as const;

export type ModelCategory = (typeof MODEL_CATEGORIES)[number];

// 공개 상태
export type Visibility = 'public' | 'shared' | 'private';

// DB 레코드 타입 (Supabase user_models 테이블)
export interface UserModelRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  is_public: boolean;
  visibility: Visibility;
  glb_storage_path: string;
  original_fbx_storage_path: string | null;
  thumbnail_storage_path: string | null;
  file_size_bytes: number;
  parts_config: UserModelPartConfig[];
  scale: number;
  camera_position: number[];
  camera_target: number[];
  created_at: string;
  updated_at: string;
}

// 부품 설정 (DB에 JSONB로 저장)
export interface UserModelPartConfig {
  id: string;
  meshName: string;
  nameKo: string;
  description: string;
  explodeDirection: [number, number, number];
  explodeDistance: number;
  color: string;
}

// 업로드 폼 데이터
export interface UploadFormData {
  name: string;
  description: string;
  category: string;
  customCategory: string;
  isPublic: boolean;
  scale: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  parts: UserModelPartConfig[];
}

// DB 레코드 → CombinedModelConfig 변환
export function userModelToConfig(
  row: UserModelRow,
  glbUrl: string,
  thumbnailUrl?: string
): CombinedModelConfig {
  const parts: CombinedPartConfig[] = (row.parts_config || []).map((p) => ({
    id: p.id,
    meshName: p.meshName,
    name: p.nameKo,
    nameKo: p.nameKo,
    description: p.description || '',
    explodeDirection: p.explodeDirection,
    explodeDistance: p.explodeDistance,
    color: p.color || '#888888',
  }));

  return {
    id: `u-${row.id}`,
    name: row.name,
    nameKo: row.name,
    description: row.description,
    theory: '',
    category: row.category,
    thumbnail: thumbnailUrl || '',
    glbPath: glbUrl,
    scale: row.scale ?? 1,
    cameraPosition: (row.camera_position as [number, number, number]) ?? [5, 3, 5],
    cameraTarget: (row.camera_target as [number, number, number]) ?? [0, 0, 0],
    parts,
  };
}

// 최대 파일 크기 (50MB)
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
