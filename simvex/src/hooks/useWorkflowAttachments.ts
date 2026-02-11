'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { WorkflowAttachmentRow } from '@/types/workflow';

const BUCKET = 'workflow-files';

export function useWorkflowAttachments(user: User | null, workflowId: string) {
  const [attachments, setAttachments] = useState<WorkflowAttachmentRow[]>([]);
  const [uploading, setUploading] = useState(false);

  // 전체 첨부 조회
  const fetchAttachments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('workflow_attachments')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true });
    setAttachments(data ?? []);
  }, [workflowId]);

  // 파일 업로드
  const uploadAttachment = useCallback(async (nodeId: string, file: File): Promise<WorkflowAttachmentRow | null> => {
    if (!user) return null;
    setUploading(true);
    const supabase = createClient();
    const storagePath = `${user.id}/${workflowId}/${nodeId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: true });
    if (uploadError) { setUploading(false); return null; }

    const { data, error } = await supabase
      .from('workflow_attachments')
      .insert({
        workflow_id: workflowId,
        node_id: nodeId,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || 'application/octet-stream',
        storage_path: storagePath,
      })
      .select()
      .single();
    setUploading(false);
    if (error || !data) return null;
    setAttachments((prev) => [...prev, data]);
    return data;
  }, [user, workflowId]);

  // 첨부 삭제
  const deleteAttachment = useCallback(async (attachmentId: string) => {
    const supabase = createClient();
    const target = attachments.find((a) => a.id === attachmentId);
    if (target) {
      await supabase.storage.from(BUCKET).remove([target.storage_path]);
    }
    await supabase.from('workflow_attachments').delete().eq('id', attachmentId);
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }, [attachments]);

  // 공개 URL
  const getDownloadUrl = useCallback((storagePath: string): string => {
    const supabase = createClient();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }, []);

  // 특정 노드의 첨부 목록
  const getNodeAttachments = useCallback((nodeId: string) => {
    return attachments.filter((a) => a.node_id === nodeId);
  }, [attachments]);

  return {
    attachments,
    uploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    getDownloadUrl,
    getNodeAttachments,
  };
}
