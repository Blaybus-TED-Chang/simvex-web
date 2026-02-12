-- ===========================================
-- 워크플로우 차트 테이블 + Storage 버킷
-- ===========================================

-- 1. workflows 테이블
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '새 워크플로우',
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private',
  share_token TEXT UNIQUE,
  nodes_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  canvas_offset FLOAT[] DEFAULT '{0,0}',
  canvas_zoom FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_share_token ON workflows(share_token) WHERE share_token IS NOT NULL;

-- RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows" ON workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shared workflows by token" ON workflows FOR SELECT USING (share_token IS NOT NULL AND visibility IN ('shared', 'public'));
CREATE POLICY "Users can insert own workflows" ON workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflows" ON workflows FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거 (함수가 이미 존재하면 재사용)
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. workflow_attachments 테이블
CREATE TABLE workflow_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_attachments_workflow ON workflow_attachments(workflow_id);

-- RLS
ALTER TABLE workflow_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage attachments" ON workflow_attachments FOR ALL
  USING (EXISTS (SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));
CREATE POLICY "Shared workflow attachments readable" ON workflow_attachments FOR SELECT
  USING (EXISTS (SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.share_token IS NOT NULL AND w.visibility IN ('shared', 'public')));

-- 3. workflow_saves 테이블 (공유받은 워크플로우 저장)
CREATE TABLE workflow_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workflow_id)
);

CREATE INDEX idx_workflow_saves_user ON workflow_saves(user_id);

-- RLS
ALTER TABLE workflow_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves" ON workflow_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saves" ON workflow_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON workflow_saves FOR DELETE USING (auth.uid() = user_id);

-- 4. Storage 버킷: workflow-files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('workflow-files', 'workflow-files', true, 52428800);

-- Storage 정책
CREATE POLICY "Public read workflow files" ON storage.objects FOR SELECT
  USING (bucket_id = 'workflow-files');
CREATE POLICY "Owner upload workflow files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'workflow-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner update workflow files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'workflow-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete workflow files" ON storage.objects FOR DELETE
  USING (bucket_id = 'workflow-files' AND auth.uid()::text = (storage.foldername(name))[1]);
