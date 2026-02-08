CREATE TABLE user_notes_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '제목 없음',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_notes_v2_user_model ON user_notes_v2(user_id, model_id);
ALTER TABLE user_notes_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notes_v2" ON user_notes_v2
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- note-images 버킷
INSERT INTO storage.buckets (id, name, public) VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "note_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'note-images');
CREATE POLICY "note_images_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'note-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "note_images_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'note-images' AND (storage.foldername(name))[1] = auth.uid()::text);
