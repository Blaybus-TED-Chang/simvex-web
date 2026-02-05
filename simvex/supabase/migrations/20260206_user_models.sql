-- ===========================================
-- 사용자 업로드 모델 테이블 + Storage 버킷
-- ===========================================

-- 1. user_models 테이블
CREATE TABLE user_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '기타',
  is_public BOOLEAN NOT NULL DEFAULT false,
  glb_storage_path TEXT NOT NULL,
  thumbnail_storage_path TEXT,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  parts_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  scale FLOAT DEFAULT 1.0,
  camera_position FLOAT[] DEFAULT '{5,3,5}',
  camera_target FLOAT[] DEFAULT '{0,0,0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_user_models_user_id ON user_models(user_id);
CREATE INDEX idx_user_models_is_public ON user_models(is_public) WHERE is_public = true;

-- RLS
ALTER TABLE user_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own models" ON user_models FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public models" ON user_models FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own models" ON user_models FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own models" ON user_models FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own models" ON user_models FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_models_updated_at BEFORE UPDATE ON user_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Storage 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-models', 'user-models', true, 52428800,
  ARRAY['model/gltf-binary','application/octet-stream','image/png','image/jpeg']);

-- Storage 정책: 누구나 읽기 (Three.js useGLTF가 직접 URL 호출)
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'user-models');

-- 본인 폴더만 쓰기/수정/삭제
CREATE POLICY "Owner upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-models' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-models' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'user-models' AND auth.uid()::text = (storage.foldername(name))[1]);
