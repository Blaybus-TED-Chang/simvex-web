'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowAttachments } from '@/hooks/useWorkflowAttachments';
import { useViewerStore } from '@/lib/store/viewerStore';
import { WorkflowToolbar } from '@/components/workflow/WorkflowToolbar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import type { WorkflowRow, WorkflowNode, WorkflowEdge } from '@/types/workflow';

const NODE_DEFAULT_WIDTH = 220;

export default function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useUser();
  const { isDarkMode } = useViewerStore();
  const { fetchWorkflowById, saveWorkflow, generateShareToken } = useWorkflows(user);
  const { attachments, uploading, fetchAttachments, uploadAttachment, deleteAttachment, getDownloadUrl } = useWorkflowAttachments(user, id);

  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [title, setTitle] = useState('');
  const [canvasOffset, setCanvasOffset] = useState<number[]>([0, 0]);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isOwner = !!(user && workflow && user.id === workflow.user_id);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { useViewerStore.persist.rehydrate(); }, []);

  // 워크플로우 로드
  useEffect(() => {
    (async () => {
      const data = await fetchWorkflowById(id);
      if (data) {
        setWorkflow(data);
        setNodes(data.nodes_data ?? []);
        setEdges(data.edges_data ?? []);
        setTitle(data.title);
        setCanvasOffset(data.canvas_offset ?? [0, 0]);
        setCanvasZoom(data.canvas_zoom ?? 1);
      }
      setLoaded(true);
    })();
  }, [id, fetchWorkflowById]);

  // 첨부 파일 로드
  useEffect(() => {
    if (loaded) fetchAttachments();
  }, [loaded, fetchAttachments]);

  // 자동 저장 (debounce 1초)
  const triggerSave = useCallback((patch: Partial<WorkflowRow>) => {
    if (!isOwner) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      await saveWorkflow(id, patch as Parameters<typeof saveWorkflow>[1]);
      setSaving(false);
    }, 1000);
  }, [isOwner, id, saveWorkflow]);

  // 노드/엣지/캔버스 변경 시 자동 저장
  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
    triggerSave({ nodes_data: newNodes });
  }, [triggerSave]);

  const handleEdgesChange = useCallback((newEdges: WorkflowEdge[]) => {
    setEdges(newEdges);
    triggerSave({ edges_data: newEdges });
  }, [triggerSave]);

  const handleTitleChange = useCallback((t: string) => {
    setTitle(t);
    triggerSave({ title: t });
  }, [triggerSave]);

  const handleCanvasOffsetChange = useCallback((offset: number[]) => {
    setCanvasOffset(offset);
    // 캔버스 팬은 빈번하므로 저장 주기를 길게
  }, []);

  const handleCanvasZoomChange = useCallback((zoom: number) => {
    setCanvasZoom(zoom);
  }, []);

  // 캔버스 상태 저장 (마우스업 시점)
  useEffect(() => {
    const handleSaveCanvasState = () => {
      if (isOwner) {
        triggerSave({ canvas_offset: canvasOffset, canvas_zoom: canvasZoom });
      }
    };
    window.addEventListener('mouseup', handleSaveCanvasState);
    return () => window.removeEventListener('mouseup', handleSaveCanvasState);
  }, [isOwner, canvasOffset, canvasZoom, triggerSave]);

  // 노드 추가
  const handleAddNode = useCallback(() => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      x: (-canvasOffset[0] + 200) / canvasZoom,
      y: (-canvasOffset[1] + 200) / canvasZoom,
      width: NODE_DEFAULT_WIDTH,
      title: '',
      content: '',
      links: [],
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    triggerSave({ nodes_data: newNodes });
  }, [nodes, canvasOffset, canvasZoom, triggerSave]);

  // 즉시 저장 (버튼 / 단축키용)
  const handleSaveNow = useCallback(async () => {
    if (!isOwner) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    await saveWorkflow(id, {
      title,
      nodes_data: nodes,
      edges_data: edges,
      canvas_offset: canvasOffset,
      canvas_zoom: canvasZoom,
    });
    setSaving(false);
  }, [isOwner, id, title, nodes, edges, canvasOffset, canvasZoom, saveWorkflow]);

  // Ctrl+S / Cmd+S 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveNow]);

  // 공유
  const handleGenerateLink = useCallback(async () => {
    return await generateShareToken(id);
  }, [id, generateShareToken]);

  // 파일 업로드
  const handleUploadFile = useCallback(async (nodeId: string, file: File) => {
    await uploadAttachment(nodeId, file);
  }, [uploadAttachment]);

  if (!loaded || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-gray-400">워크플로우 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[16px] font-semibold text-gray-800 mb-1">워크플로우를 찾을 수 없습니다</p>
        <p className="text-[13px] text-gray-400 mb-5">삭제되었거나 접근 권한이 없을 수 있습니다</p>
        <a
          href="/workflow"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#001AFF] hover:bg-[#0015D4] transition-colors shadow-sm shadow-[#001AFF]/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <WorkflowToolbar
        title={title}
        isDarkMode={isDarkMode}
        isOwner={isOwner}
        saving={saving}
        onTitleChange={handleTitleChange}
        onSave={handleSaveNow}
        onAddNode={handleAddNode}
        onGenerateShareLink={handleGenerateLink}
      />
      <WorkflowCanvas
        nodes={nodes}
        edges={edges}
        isOwner={isOwner}
        isDarkMode={isDarkMode}
        canvasOffset={canvasOffset}
        canvasZoom={canvasZoom}
        attachments={attachments}
        uploading={uploading}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onCanvasOffsetChange={handleCanvasOffsetChange}
        onCanvasZoomChange={handleCanvasZoomChange}
        onUploadFile={handleUploadFile}
        onDeleteAttachment={deleteAttachment}
        getDownloadUrl={getDownloadUrl}
      />
    </div>
  );
}
