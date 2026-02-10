-- ===========================================
-- visibility 컬럼 추가 (public / shared / private)
-- ===========================================

-- 1. visibility 컬럼 추가
ALTER TABLE user_models
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private';

-- 2. 기존 데이터 마이그레이션 (is_public → visibility)
UPDATE user_models
  SET visibility = CASE WHEN is_public THEN 'public' ELSE 'private' END;

-- 3. RLS 업데이트: 공유 모델도 조회 가능
DROP POLICY IF EXISTS "Anyone can view public models" ON user_models;
CREATE POLICY "Anyone can view public or shared models" ON user_models
  FOR SELECT USING (visibility IN ('public', 'shared'));
