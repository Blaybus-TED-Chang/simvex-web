'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { WorkflowRow, WorkflowNode, WorkflowEdge } from '@/types/workflow';

function generateToken(len = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => chars[b % chars.length])
    .join('');
}

export function useWorkflows(user: User | null) {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 내 워크플로우 목록
  const fetchMyWorkflows = useCallback(async () => {
    if (!user) { setWorkflows([]); return; }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setWorkflows(data ?? []);
    setLoading(false);
  }, [user]);

  // 공유받은 워크플로우 목록
  const fetchSavedWorkflows = useCallback(async () => {
    if (!user) { setSavedWorkflows([]); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('workflow_saves')
      .select('workflow_id, workflows(*)')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });
    const rows = (data ?? [])
      .map((d: Record<string, unknown>) => d.workflows as WorkflowRow | null)
      .filter((w): w is WorkflowRow => w !== null);
    setSavedWorkflows(rows);
  }, [user]);

  // 단건 조회
  const fetchWorkflowById = useCallback(async (id: string): Promise<WorkflowRow | null> => {
    const supabase = createClient();
    const { data } = await supabase.from('workflows').select('*').eq('id', id).single();
    return data ?? null;
  }, []);

  // 공유 토큰으로 조회
  const fetchWorkflowByShareToken = useCallback(async (token: string): Promise<WorkflowRow | null> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('workflows')
      .select('*')
      .eq('share_token', token)
      .single();
    return data ?? null;
  }, []);

  // 생성
  const createWorkflow = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('workflows')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id;
  }, [user]);

  // 저장 (노드/엣지/캔버스 상태)
  const saveWorkflow = useCallback(async (
    id: string,
    patch: {
      title?: string;
      description?: string;
      nodes_data?: WorkflowNode[];
      edges_data?: WorkflowEdge[];
      canvas_offset?: number[];
      canvas_zoom?: number;
    },
  ) => {
    const supabase = createClient();
    await supabase.from('workflows').update(patch).eq('id', id);
  }, []);

  // 삭제
  const deleteWorkflow = useCallback(async (id: string) => {
    if (!user) return;
    const supabase = createClient();
    // Storage 파일 삭제
    const { data: files } = await supabase.storage
      .from('workflow-files')
      .list(`${user.id}/${id}`);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${id}/${f.name}`);
      await supabase.storage.from('workflow-files').remove(paths);
    }
    await supabase.from('workflows').delete().eq('id', id);
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }, [user]);

  // 공유 토큰 생성
  const generateShareToken = useCallback(async (id: string): Promise<string | null> => {
    const supabase = createClient();
    // 기존 토큰이 있으면 재사용
    const { data: existing } = await supabase
      .from('workflows')
      .select('share_token')
      .eq('id', id)
      .single();
    if (existing?.share_token) return existing.share_token;

    const token = generateToken(12);
    const { error } = await supabase
      .from('workflows')
      .update({ share_token: token, visibility: 'shared' })
      .eq('id', id);
    if (error) return null;
    return token;
  }, []);

  // 공개 상태 변경
  const changeVisibility = useCallback(async (id: string, visibility: 'private' | 'shared' | 'public') => {
    const supabase = createClient();
    const update: Record<string, unknown> = { visibility };
    if (visibility === 'private') update.share_token = null;
    await supabase.from('workflows').update(update).eq('id', id);
  }, []);

  // 공유받은 워크플로우 저장
  const saveSharedWorkflow = useCallback(async (workflowId: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from('workflow_saves')
      .upsert({ user_id: user.id, workflow_id: workflowId }, { onConflict: 'user_id,workflow_id' });
  }, [user]);

  // 공유받은 워크플로우 저장 제거
  const removeSavedWorkflow = useCallback(async (workflowId: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from('workflow_saves')
      .delete()
      .eq('user_id', user.id)
      .eq('workflow_id', workflowId);
    setSavedWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
  }, [user]);

  return {
    workflows,
    savedWorkflows,
    loading,
    fetchMyWorkflows,
    fetchSavedWorkflows,
    fetchWorkflowById,
    fetchWorkflowByShareToken,
    createWorkflow,
    saveWorkflow,
    deleteWorkflow,
    generateShareToken,
    changeVisibility,
    saveSharedWorkflow,
    removeSavedWorkflow,
  };
}
