-- 부품 커스터마이징 테이블
CREATE TABLE part_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  part_id TEXT NOT NULL,
  custom_color TEXT,
  custom_name_ko TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model_id, part_id)
);

ALTER TABLE part_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_customizations" ON part_customizations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 부품 메모 테이블
CREATE TABLE part_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  part_id TEXT NOT NULL,
  content TEXT NOT NULL,
  screenshot_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE part_memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_memos" ON part_memos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- part-memos Storage 버킷 (공개 읽기, 쓰기는 본인 폴더만)
INSERT INTO storage.buckets (id, name, public) VALUES ('part-memos', 'part-memos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "part_memos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'part-memos');

CREATE POLICY "part_memos_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'part-memos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "part_memos_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'part-memos' AND (storage.foldername(name))[1] = auth.uid()::text);
