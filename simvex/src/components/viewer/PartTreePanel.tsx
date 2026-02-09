'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { CombinedPartConfig } from '@/components/viewer/CombinedGLBPart';
import { PartTreeGroup } from '@/types/viewer';

interface PartTreePanelProps {
  isDarkMode: boolean;
  modelNameKo: string;
  rootName?: string;
  parts: CombinedPartConfig[];
  selectedPartId: string | null;
  focusedPartId: string | null;
  visibleParts: string[];
  groups: PartTreeGroup[];
  onFocusPart: (partId: string | null) => void;
  onSelectPart: (partId: string | null) => void;
  onToggleVisibility: (partId: string) => void;
  onSetAllVisible: (partIds: string[]) => void;
  onCreateGroup: (name: string, parentGroupId?: string | null) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onMovePartToGroup: (partId: string, groupId: string | null) => void;
  onToggleGroupCollapsed: (groupId: string) => void;
  onMoveGroupToGroup: (sourceGroupId: string, targetGroupId: string | null) => void;
  onReorderGroups: (parentGroupId: string | null, orderedGroupIds: string[]) => void;
  onRenameRoot?: (name: string) => void;
}

/* ── 아이콘 SVG ── */
function EyeIcon({ visible, className }: { visible: boolean; className?: string }) {
  if (visible) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.592M6.938 6.938A9.966 9.966 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.043 5.207M6.938 6.938L3 3m3.938 3.938l3.124 3.124m6.876 6.876L21 21m-3.938-3.938l-3.124-3.124m0 0a3 3 0 01-4.243-4.243m4.243 4.243L9.88 9.88" />
    </svg>
  );
}

/* ── DnD 타입 ── */
type DragItem = { type: 'part'; partId: string } | { type: 'group'; groupId: string };
type DropZone =
  | { type: 'group-inside'; groupId: string }
  | { type: 'group-before'; groupId: string; parentGroupId: string | null }
  | { type: 'group-after'; groupId: string; parentGroupId: string | null }
  | { type: 'root' }
  | null;

export function PartTreePanel({
  isDarkMode,
  modelNameKo,
  rootName,
  parts,
  selectedPartId,
  focusedPartId,
  visibleParts,
  groups,
  onFocusPart,
  onSelectPart,
  onToggleVisibility,
  onSetAllVisible,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
  onMovePartToGroup,
  onToggleGroupCollapsed,
  onMoveGroupToGroup,
  onReorderGroups,
  onRenameRoot,
}: PartTreePanelProps) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [creatingGroupParentId, setCreatingGroupParentId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [moveMenuPartId, setMoveMenuPartId] = useState<string | null>(null);
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null);
  const [isEditingRootName, setIsEditingRootName] = useState(false);
  const [editingRootName, setEditingRootName] = useState('');
  const newGroupInputRef = useRef<HTMLInputElement>(null);
  const editGroupInputRef = useRef<HTMLInputElement>(null);
  const editRootInputRef = useRef<HTMLInputElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  // DnD 상태
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dropZone, setDropZone] = useState<DropZone>(null);

  // 그룹 맵
  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

  // 최상위 그룹만 (parentGroupId === null)
  const topLevelGroups = useMemo(
    () => groups.filter((g) => !g.parentGroupId),
    [groups],
  );

  // 그룹에 속한 부품 ID 세트
  const groupedPartIds = useMemo(
    () => new Set(groups.flatMap((g) => g.childPartIds)),
    [groups],
  );

  // 미그룹 부품
  const ungroupedParts = useMemo(
    () => parts.filter((p) => !groupedPartIds.has(p.id)),
    [parts, groupedPartIds],
  );

  // 새 그룹 input 자동 포커스
  useEffect(() => {
    if (isCreatingGroup) newGroupInputRef.current?.focus();
  }, [isCreatingGroup]);

  // 그룹 이름 편집 input 자동 포커스
  useEffect(() => {
    if (editingGroupId) editGroupInputRef.current?.focus();
  }, [editingGroupId]);

  // 루트 이름 편집 input 자동 포커스
  useEffect(() => {
    if (isEditingRootName) editRootInputRef.current?.focus();
  }, [isEditingRootName]);

  // 이동 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!moveMenuPartId) return;
    const handler = (e: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setMoveMenuPartId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moveMenuPartId]);

  const allVisible = parts.length > 0 && parts.every((p) => visibleParts.includes(p.id));
  const displayRootName = rootName || modelNameKo;

  /* ── 핸들러 ── */
  const handleRootClick = () => {
    onFocusPart(null);
    onSelectPart(null);
  };

  const handlePartClick = (partId: string) => {
    onFocusPart(partId);
    onSelectPart(partId);
  };

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (name) {
      onCreateGroup(name, creatingGroupParentId);
      setNewGroupName('');
      setIsCreatingGroup(false);
      setCreatingGroupParentId(null);
    }
  };

  const handleRenameGroup = (groupId: string) => {
    const name = editingGroupName.trim();
    if (name) {
      onRenameGroup(groupId, name);
    }
    setEditingGroupId(null);
  };

  const handleRenameRoot = () => {
    const name = editingRootName.trim();
    if (name && onRenameRoot) {
      onRenameRoot(name);
    }
    setIsEditingRootName(false);
  };

  /** 그룹 + 모든 자손 그룹의 부품 ID를 재귀적으로 수집 */
  const collectAllPartIds = useCallback((group: PartTreeGroup): string[] => {
    const result = [...group.childPartIds];
    for (const childGroupId of (group.childGroupIds ?? [])) {
      const childGroup = groupMap.get(childGroupId);
      if (childGroup) result.push(...collectAllPartIds(childGroup));
    }
    return result;
  }, [groupMap]);

  const handleGroupVisibilityToggle = (group: PartTreeGroup) => {
    const allPartIds = collectAllPartIds(group);
    const groupParts = parts.filter((p) => allPartIds.includes(p.id));
    const allGroupVisible = groupParts.length > 0 && groupParts.every((p) => visibleParts.includes(p.id));
    if (allGroupVisible) {
      const newVisible = visibleParts.filter((id) => !allPartIds.includes(id));
      onSetAllVisible(newVisible);
    } else {
      const newVisible = [...new Set([...visibleParts, ...allPartIds])];
      onSetAllVisible(newVisible);
    }
  };

  /* ── DnD 핸들러 ── */
  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    setDragItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
    setDropZone(null);
  }, []);

  const getDropZoneFromEvent = useCallback(
    (e: React.DragEvent, groupId: string, parentGroupId: string | null): DropZone => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = y / rect.height;
      if (ratio < 0.25) return { type: 'group-before', groupId, parentGroupId };
      if (ratio > 0.75) return { type: 'group-after', groupId, parentGroupId };
      return { type: 'group-inside', groupId };
    },
    [],
  );

  const handleGroupDragOver = useCallback(
    (e: React.DragEvent, groupId: string, parentGroupId: string | null) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropZone(getDropZoneFromEvent(e, groupId, parentGroupId));
    },
    [getDropZoneFromEvent],
  );

  const handleGroupDrop = useCallback(
    (e: React.DragEvent, groupId: string, parentGroupId: string | null) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragItem) return;

      const zone = getDropZoneFromEvent(e, groupId, parentGroupId);

      if (dragItem.type === 'part') {
        if (zone?.type === 'group-inside') {
          onMovePartToGroup(dragItem.partId, groupId);
        } else {
          onMovePartToGroup(dragItem.partId, parentGroupId);
        }
      } else if (dragItem.type === 'group') {
        if (dragItem.groupId === groupId) {
          // 자기 자신에 드롭 무시
        } else if (zone?.type === 'group-inside') {
          onMoveGroupToGroup(dragItem.groupId, groupId);
        } else if (zone?.type === 'group-before' || zone?.type === 'group-after') {
          const siblingIds = parentGroupId
            ? (groupMap.get(parentGroupId)?.childGroupIds ?? [])
            : topLevelGroups.map((g) => g.id);

          const sourceGroup = groupMap.get(dragItem.groupId);
          if (sourceGroup && sourceGroup.parentGroupId !== parentGroupId) {
            onMoveGroupToGroup(dragItem.groupId, parentGroupId);
          }

          const filtered = siblingIds.filter((id) => id !== dragItem.groupId);
          const targetIdx = filtered.indexOf(groupId);
          const insertIdx = zone.type === 'group-before' ? targetIdx : targetIdx + 1;
          filtered.splice(insertIdx, 0, dragItem.groupId);
          onReorderGroups(parentGroupId, filtered);
        }
      }

      setDragItem(null);
      setDropZone(null);
    },
    [dragItem, getDropZoneFromEvent, onMovePartToGroup, onMoveGroupToGroup, onReorderGroups, groupMap, topLevelGroups],
  );

  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZone({ type: 'root' });
  }, []);

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragItem) return;
      if (dragItem.type === 'part') {
        onMovePartToGroup(dragItem.partId, null);
      } else if (dragItem.type === 'group') {
        onMoveGroupToGroup(dragItem.groupId, null);
      }
      setDragItem(null);
      setDropZone(null);
    },
    [dragItem, onMovePartToGroup, onMoveGroupToGroup],
  );

  /* ── 이동 드롭다운 메뉴 (중첩 지원) ── */
  const renderMoveMenuGroups = (parentId: string | null, indent: number): React.ReactNode[] => {
    const siblings = parentId
      ? (groupMap.get(parentId)?.childGroupIds ?? [])
      : topLevelGroups.map((g) => g.id);

    return siblings.flatMap((gid) => {
      const g = groupMap.get(gid);
      if (!g) return [];
      const currentPart = moveMenuPartId ? parts.find((p) => p.id === moveMenuPartId) : null;
      const isInGroup = currentPart ? g.childPartIds.includes(currentPart.id) : false;

      return [
        <button
          key={g.id}
          className={`w-full text-left py-1.5 text-xs transition-colors ${
            isInGroup
              ? isDarkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50'
              : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${indent * 12 + 12}px`, paddingRight: '12px' }}
          onClick={() => {
            if (moveMenuPartId) {
              onMovePartToGroup(moveMenuPartId, isInGroup ? null : g.id);
              setMoveMenuPartId(null);
            }
          }}
        >
          {isInGroup ? `✓ ${g.name}` : g.name}
        </button>,
        ...renderMoveMenuGroups(g.id, indent + 1),
      ];
    });
  };

  /* ── 드롭 존 스타일 ── */
  const getGroupDropStyle = (groupId: string) => {
    if (!dropZone) return {};
    if (dropZone.type === 'group-inside' && dropZone.groupId === groupId) {
      return { outline: '2px solid rgba(6, 182, 212, 0.5)', outlineOffset: '-2px' };
    }
    if (dropZone.type === 'group-before' && dropZone.groupId === groupId) {
      return { borderTop: '2px solid rgb(6, 182, 212)' };
    }
    if (dropZone.type === 'group-after' && dropZone.groupId === groupId) {
      return { borderBottom: '2px solid rgb(6, 182, 212)' };
    }
    return {};
  };

  /* ── 부품 행 렌더링 ── */
  const renderPartRow = (part: CombinedPartConfig, indent: number) => {
    const isActive = focusedPartId === part.id;
    const isSelected = selectedPartId === part.id;
    const isVisible = visibleParts.includes(part.id);

    return (
      <div key={part.id} className="relative group/part">
        <div
          className={`w-full flex items-center gap-1.5 text-sm transition-colors cursor-pointer pr-2 py-1.5 ${
            isActive
              ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
              : isSelected
                ? isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
                : isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
          style={{ paddingLeft: `${indent * 16 + 12}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, { type: 'part', partId: part.id })}
          onDragEnd={handleDragEnd}
        >
          {/* 부품 클릭 영역 */}
          <button
            className={`flex-1 min-w-0 flex items-center gap-2 text-left ${!isVisible ? 'opacity-50' : ''}`}
            onClick={() => handlePartClick(part.id)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 border"
              style={{
                backgroundColor: part.color || '#888888',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              }}
            />
            <span className="truncate">{part.nameKo}</span>
          </button>

          {/* 눈 아이콘 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(part.id); }}
            title={isVisible ? '숨기기' : '보이기'}
          >
            <EyeIcon visible={isVisible} className={`w-3.5 h-3.5 ${
              isVisible
                ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
                : isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
          </button>

          {/* 이동 버튼 (그룹이 있을 때만) */}
          {groups.length > 0 && (
            <button
              className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover/part:opacity-100 transition-all ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setMoveMenuPartId(moveMenuPartId === part.id ? null : part.id);
              }}
              title="그룹 이동"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          )}
        </div>

        {/* 이동 드롭다운 */}
        {moveMenuPartId === part.id && (
          <div
            ref={moveMenuRef}
            className={`absolute right-2 top-full z-50 mt-1 py-1 rounded-lg shadow-lg border min-w-[140px] ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {renderMoveMenuGroups(null, 0)}
            {groupedPartIds.has(part.id) && (
              <>
                <div className={`mx-2 my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                <button
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    onMovePartToGroup(part.id, null);
                    setMoveMenuPartId(null);
                  }}
                >
                  그룹 해제
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ── 그룹 재귀 렌더링 ── */
  const renderGroup = (group: PartTreeGroup, depth: number): React.ReactNode => {
    const allPartIds = collectAllPartIds(group);
    const groupParts = parts.filter((p) => allPartIds.includes(p.id));
    const allGroupVisible = groupParts.length > 0 && groupParts.every((p) => visibleParts.includes(p.id));
    const isEditing = editingGroupId === group.id;
    const isConfirmingDelete = confirmDeleteGroupId === group.id;
    const childGroups = (group.childGroupIds ?? [])
      .map((id) => groupMap.get(id))
      .filter(Boolean) as PartTreeGroup[];
    const directParts = parts.filter((p) => group.childPartIds.includes(p.id));

    return (
      <div key={group.id}>
        {/* 그룹 헤더 */}
        <div
          className={`flex items-center gap-1 py-1.5 pr-2 group/group ${
            isDarkMode ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-50'
          }`}
          style={{
            paddingLeft: `${depth * 16 - 4}px`,
            ...getGroupDropStyle(group.id),
          }}
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            handleDragStart(e, { type: 'group', groupId: group.id });
          }}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            e.stopPropagation();
            handleGroupDragOver(e, group.id, group.parentGroupId);
          }}
          onDragLeave={() => setDropZone(null)}
          onDrop={(e) => {
            e.stopPropagation();
            handleGroupDrop(e, group.id, group.parentGroupId);
          }}
        >
          {/* 접기/펼치기 */}
          <button
            className="flex-shrink-0 p-0.5"
            onClick={() => onToggleGroupCollapsed(group.id)}
          >
            <svg className={`w-3 h-3 transition-transform ${group.collapsed ? '' : 'rotate-90'}`}
              fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd" />
            </svg>
          </button>

          {/* 폴더 아이콘 */}
          <svg className={`w-4 h-4 flex-shrink-0 ${
            isDarkMode ? 'text-yellow-500/70' : 'text-yellow-600/70'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>

          {/* 그룹 이름 */}
          {isEditing ? (
            <input
              ref={editGroupInputRef}
              className={`flex-1 min-w-0 text-sm px-1 py-0 rounded border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
              value={editingGroupName}
              onChange={(e) => setEditingGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameGroup(group.id);
                if (e.key === 'Escape') setEditingGroupId(null);
              }}
              onBlur={() => handleRenameGroup(group.id)}
            />
          ) : (
            <span className="flex-1 min-w-0 text-sm font-medium truncate">{group.name}</span>
          )}

          {/* 그룹 눈 아이콘 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            onClick={(e) => { e.stopPropagation(); handleGroupVisibilityToggle(group); }}
            title={allGroupVisible ? '그룹 숨기기' : '그룹 보이기'}
          >
            <EyeIcon visible={allGroupVisible} className={`w-3.5 h-3.5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </button>

          {/* 하위 그룹 추가 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover/group:opacity-100 transition-all ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
            }`}
            onClick={() => {
              setCreatingGroupParentId(group.id);
              setIsCreatingGroup(true);
              setNewGroupName('');
            }}
            title="하위 그룹 추가"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 이름 변경 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover/group:opacity-100 transition-all ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
            }`}
            onClick={() => {
              setEditingGroupId(group.id);
              setEditingGroupName(group.name);
            }}
            title="이름 변경"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* 삭제 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover/group:opacity-100 transition-all ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
            }`}
            onClick={() => setConfirmDeleteGroupId(group.id)}
            title="그룹 삭제"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* 삭제 확인 인라인 UI */}
        {isConfirmingDelete && (
          <div
            className={`mx-2 mb-1 p-2 rounded-lg text-xs ${
              isDarkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
            }`}
            style={{ marginLeft: `${depth * 16 + 8}px` }}
          >
            <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
              이 그룹을 삭제하면 내부 부품과 하위 그룹은 상위 그룹으로 이동합니다.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                className={`px-2 py-0.5 rounded text-xs ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setConfirmDeleteGroupId(null)}
              >
                취소
              </button>
              <button
                className={`px-2 py-0.5 rounded text-xs ${
                  isDarkMode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                onClick={() => {
                  onDeleteGroup(group.id);
                  setConfirmDeleteGroupId(null);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        )}

        {/* 그룹 내용 (접기/펼치기) */}
        {!group.collapsed && (
          <>
            {/* 하위 그룹 (재귀) */}
            {childGroups.map((child) => renderGroup(child, depth + 1))}

            {/* 하위 그룹 생성 인라인 input */}
            {isCreatingGroup && creatingGroupParentId === group.id && (
              <div className="flex items-center gap-1 py-1.5" style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
                <svg className={`w-4 h-4 flex-shrink-0 ${
                  isDarkMode ? 'text-yellow-500/70' : 'text-yellow-600/70'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <input
                  ref={newGroupInputRef}
                  className={`flex-1 min-w-0 text-sm px-2 py-0.5 rounded border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                  }`}
                  placeholder="하위 그룹 이름"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateGroup();
                    if (e.key === 'Escape') { setIsCreatingGroup(false); setNewGroupName(''); setCreatingGroupParentId(null); }
                  }}
                  onBlur={() => {
                    if (!newGroupName.trim()) { setIsCreatingGroup(false); setNewGroupName(''); setCreatingGroupParentId(null); }
                    else handleCreateGroup();
                  }}
                />
              </div>
            )}

            {/* 직접 포함된 부품 */}
            {directParts.map((part) => renderPartRow(part, depth + 1))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className={`px-3 py-2 border-b flex-shrink-0 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          부품 트리
        </h3>
      </div>

      {/* 트리 목록 */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* 최상위: 모델 전체 (그룹 헤더 스타일) */}
        <div
          className={`flex items-center gap-1.5 py-1.5 pr-2 group/root ${
            !focusedPartId
              ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
              : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ paddingLeft: '8px' }}
        >
          {/* 폴더 아이콘 + 이름 클릭 영역 */}
          {isEditingRootName ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <input
                ref={editRootInputRef}
                className={`flex-1 min-w-0 text-sm px-1 py-0 rounded border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
                value={editingRootName}
                onChange={(e) => setEditingRootName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameRoot();
                  if (e.key === 'Escape') setIsEditingRootName(false);
                }}
                onBlur={() => handleRenameRoot()}
              />
            </>
          ) : (
            <button
              className="flex-1 min-w-0 flex items-center gap-2 text-left"
              onClick={handleRootClick}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-medium text-sm truncate">{displayRootName}</span>
            </button>
          )}

          {/* 전체 눈 아이콘 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (allVisible) {
                onSetAllVisible([]);
              } else {
                onSetAllVisible(parts.map((p) => p.id));
              }
            }}
            title={allVisible ? '모두 숨기기' : '모두 보이기'}
          >
            <EyeIcon visible={allVisible} className={`w-3.5 h-3.5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </button>

          {/* 새 그룹 추가 */}
          <button
            className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover/root:opacity-100 transition-all ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCreatingGroupParentId(null);
              setIsCreatingGroup(true);
              setNewGroupName('');
            }}
            title="새 그룹"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 이름 변경 */}
          {onRenameRoot && (
            <button
              className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover/root:opacity-100 transition-all ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingRootName(true);
                setEditingRootName(displayRootName);
              }}
              title="이름 변경"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        {/* 최상위 그룹들 (재귀) */}
        {topLevelGroups.map((group) => renderGroup(group, 1))}

        {/* 최상위 새 그룹 생성 인라인 input */}
        {isCreatingGroup && creatingGroupParentId === null && (
          <div className="flex items-center gap-1 px-3 py-1.5">
            <svg className={`w-4 h-4 flex-shrink-0 ${
              isDarkMode ? 'text-yellow-500/70' : 'text-yellow-600/70'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <input
              ref={newGroupInputRef}
              className={`flex-1 min-w-0 text-sm px-2 py-0.5 rounded border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
              placeholder="그룹 이름"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGroup();
                if (e.key === 'Escape') { setIsCreatingGroup(false); setNewGroupName(''); setCreatingGroupParentId(null); }
              }}
              onBlur={() => {
                if (!newGroupName.trim()) { setIsCreatingGroup(false); setNewGroupName(''); setCreatingGroupParentId(null); }
                else handleCreateGroup();
              }}
            />
          </div>
        )}

        {/* 미그룹 부품 영역 (드롭 존) */}
        {ungroupedParts.length > 0 && groups.length > 0 && (
          <div className={`mx-3 my-1 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`} />
        )}
        <div
          onDragOver={handleRootDragOver}
          onDragLeave={() => setDropZone(null)}
          onDrop={handleRootDrop}
          className={`min-h-[8px] ${
            dropZone?.type === 'root' ? (isDarkMode ? 'bg-cyan-900/20' : 'bg-cyan-50') : ''
          }`}
        >
          {ungroupedParts.map((part) => renderPartRow(part, 1))}
        </div>
      </div>
    </div>
  );
}
