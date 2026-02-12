'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useViewerStore } from '@/lib/store/viewerStore';
import { WorkflowList } from '@/components/workflow/WorkflowList';

export default function WorkflowListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { isDarkMode } = useViewerStore();
  const {
    workflows,
    savedWorkflows,
    loading,
    fetchMyWorkflows,
    fetchSavedWorkflows,
    createWorkflow,
    deleteWorkflow,
    removeSavedWorkflow,
  } = useWorkflows(user);

  const [tab, setTab] = useState<'my' | 'saved'>('my');

  useEffect(() => { useViewerStore.persist.rehydrate(); }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchMyWorkflows();
      fetchSavedWorkflows();
    }
  }, [user, fetchMyWorkflows, fetchSavedWorkflows]);

  const handleCreate = async () => {
    const id = await createWorkflow();
    if (id) router.push(`/workflow/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('워크플로우를 삭제하시겠습니까?')) return;
    await deleteWorkflow(id);
  };

  const handleRemoveSaved = async (id: string) => {
    await removeSavedWorkflow(id);
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const bg = isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const tabActive = isDarkMode ? 'border-blue-500 text-blue-400' : 'border-blue-500 text-blue-600';
  const tabInactive = isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700';

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/models" className="text-gray-400 hover:text-gray-600 text-lg">&larr;</Link>
            <h1 className="text-xl font-bold">워크플로우</h1>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            + 새 워크플로우
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-4 mb-6 border-b border-gray-600">
          <button
            onClick={() => setTab('my')}
            className={`pb-2 text-sm font-medium border-b-2 ${tab === 'my' ? tabActive : tabInactive}`}
          >
            내 워크플로우 ({workflows.length})
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`pb-2 text-sm font-medium border-b-2 ${tab === 'saved' ? tabActive : tabInactive}`}
          >
            공유받은 워크플로우 ({savedWorkflows.length})
          </button>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
        ) : tab === 'my' ? (
          <WorkflowList
            workflows={workflows}
            isDarkMode={isDarkMode}
            isOwner={true}
            onDelete={handleDelete}
          />
        ) : (
          <WorkflowList
            workflows={savedWorkflows}
            isDarkMode={isDarkMode}
            isOwner={false}
            onRemoveSaved={handleRemoveSaved}
          />
        )}
      </div>
    </div>
  );
}
