-- 모델 스크랩(즐겨찾기) 테이블
CREATE TABLE model_scraps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_type TEXT NOT NULL CHECK (model_type IN ('builtin', 'user')),
  model_id TEXT NOT NULL,
  user_model_id UUID REFERENCES user_models(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 유니크 인덱스: 같은 사용자가 같은 모델을 중복 스크랩 불가
CREATE UNIQUE INDEX idx_model_scraps_unique ON model_scraps(user_id, model_type, model_id);

-- 사용자별 조회 인덱스
CREATE INDEX idx_model_scraps_user ON model_scraps(user_id);

-- RLS 활성화
ALTER TABLE model_scraps ENABLE ROW LEVEL SECURITY;

-- 본인 스크랩만 조회
CREATE POLICY "own_select" ON model_scraps FOR SELECT USING (auth.uid() = user_id);

-- 본인만 스크랩 추가
CREATE POLICY "own_insert" ON model_scraps FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인만 스크랩 삭제
CREATE POLICY "own_delete" ON model_scraps FOR DELETE USING (auth.uid() = user_id);
