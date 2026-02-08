// 3D 주석(Annotation) 타입 정의

// DB 레코드 타입 (Supabase annotations 테이블)
export interface AnnotationRow {
  id: string;
  user_id: string;
  model_id: string;
  target_type: 'part' | 'coordinate';
  part_id: string | null;
  position: number[];           // [x, y, z]
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// 주석 생성 입력 타입
export interface AnnotationInput {
  model_id: string;
  target_type: 'part' | 'coordinate';
  part_id?: string | null;
  position: [number, number, number];
  title: string;
  content: string;
  color?: string;
}

// 색상 프리셋
export const ANNOTATION_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
] as const;
