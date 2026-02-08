-- 3D 주석(Annotation) 테이블
CREATE TABLE annotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('part', 'coordinate')),
  part_id TEXT,
  position FLOAT[] NOT NULL,           -- [x,y,z] 비분해 상태 좌표
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_annotations_user_model ON annotations(user_id, model_id);
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON annotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON annotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON annotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON annotations FOR DELETE USING (auth.uid() = user_id);
