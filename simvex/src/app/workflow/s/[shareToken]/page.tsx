'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowAttachments } from '@/hooks/useWorkflowAttachments';
import { useViewerStore } from '@/lib/store/viewerStore';
import { WorkflowToolbar } from '@/components/workflow/WorkflowToolbar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import type { WorkflowRow } from '@/types/workflow';

export default function WorkflowSharePage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { isDarkMode } = useViewerStore();
  const { fetchWorkflowByShareToken, saveSharedWorkflow } = useWorkflows(user);

  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [loaded, setLoaded] = useState(false);

  const workflowId = workflow?.id ?? '';
  const { attachments, fetchAttachments, getDownloadUrl } = useWorkflowAttachments(user, workflowId);

  useEffect(() => { useViewerStore.persist.rehydrate(); }, []);

  // 공유 토큰으로 워크플로우 로드
  useEffect(() => {
    (async () => {
      const data = await fetchWorkflowByShareToken(shareToken);
      if (data) {
        setWorkflow(data);
        // 로그인 상태면 자동 저장 후 리다이렉트
        if (user) {
          await saveSharedWorkflow(data.id);
          router.replace(`/workflow/${data.id}`);
          return;
        }
      }
      setLoaded(true);
    })();
  }, [shareToken, user, fetchWorkflowByShareToken, saveSharedWorkflow, router]);

  // 첨부 로드
  useEffect(() => {
    if (loaded && workflow) fetchAttachments();
  }, [loaded, workflow, fetchAttachments]);

  if (!loaded || authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
        공유된 워크플로우를 찾을 수 없습니다.
      </div>
    );
  }

  // 읽기 전용 렌더링 (비로그인 사용자)
  const nodes = workflow.nodes_data ?? [];
  const edges = workflow.edges_data ?? [];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <WorkflowToolbar
        title={workflow.title}
        isDarkMode={isDarkMode}
        isOwner={false}
        saving={false}
        onTitleChange={() => {}}
        onAddNode={() => {}}
        onGenerateShareLink={async () => null}
      />
      <WorkflowCanvas
        nodes={nodes}
        edges={edges}
        isOwner={false}
        isDarkMode={isDarkMode}
        canvasOffset={workflow.canvas_offset ?? [0, 0]}
        canvasZoom={workflow.canvas_zoom ?? 1}
        attachments={attachments}
        uploading={false}
        onNodesChange={() => {}}
        onEdgesChange={() => {}}
        onCanvasOffsetChange={() => {}}
        onCanvasZoomChange={() => {}}
        onUploadFile={() => {}}
        onDeleteAttachment={() => {}}
        getDownloadUrl={getDownloadUrl}
      />
    </div>
  );
}
