-- 공유 기능: user_models SELECT 정책 변경
-- 기존: 본인 모델 + 공개 모델만 조회 가능
-- 변경: 모든 모델 조회 허용 (UUID가 곧 인증 = link sharing)
-- is_public은 홈페이지 커뮤니티 섹션 노출 여부로만 사용

DROP POLICY IF EXISTS "Users can view own models" ON user_models;
DROP POLICY IF EXISTS "Anyone can view public models" ON user_models;

CREATE POLICY "Anyone can view any model by id" ON user_models
  FOR SELECT USING (true);
