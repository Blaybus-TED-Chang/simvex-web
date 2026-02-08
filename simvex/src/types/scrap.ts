/** model_scraps 테이블 행 타입 */
export interface ScrapRow {
  id: string;
  user_id: string;
  model_type: 'builtin' | 'user';
  model_id: string;
  user_model_id: string | null;
  created_at: string;
}

/** 스크랩 추가 시 입력 타입 */
export interface ScrapInput {
  model_type: 'builtin' | 'user';
  model_id: string;
  user_model_id?: string;
}
