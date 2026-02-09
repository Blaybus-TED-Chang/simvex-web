import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewerState, ViewerActions, ModelViewState, PartTreeGroup } from '@/types/viewer';

/* ── 헬퍼 함수 ── */

/** 기존 localStorage 데이터 마이그레이션: childGroupIds/parentGroupId 기본값 부여 */
function normalizeGroup(g: PartTreeGroup): PartTreeGroup {
  return {
    ...g,
    childGroupIds: g.childGroupIds ?? [],
    parentGroupId: g.parentGroupId ?? null,
  };
}

/** 자손 그룹 ID를 재귀 수집 (순환 참조 방지용) */
function collectDescendantGroupIds(groups: PartTreeGroup[], groupId: string): Set<string> {
  const result = new Set<string>();
  const stack = [groupId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    const g = groups.find((x) => x.id === id);
    if (!g) continue;
    for (const childId of g.childGroupIds) {
      if (!result.has(childId)) {
        result.add(childId);
        stack.push(childId);
      }
    }
  }
  return result;
}

/** 모델의 그룹 배열을 가져오면서 자동 마이그레이션 */
function getGroups(ms: ModelViewState | undefined): PartTreeGroup[] {
  return (ms?.partTreeGroups ?? []).map(normalizeGroup);
}

const initialState: ViewerState = {
  currentModel: null,
  explodeValue: 0,
  selectedPartId: null,
  visibleParts: [],
  hoveredPartId: null,
  notes: '',
  isDarkMode: false,
  globalOpacity: 1,
  modelStates: {},
  showControlsGuide: true,
};

export const useViewerStore = create<ViewerState & ViewerActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentModel: (modelId) =>
        set((state) => ({
          currentModel: modelId,
          selectedPartId: null,
          // 같은 모델이면 저장된 explodeValue 유지
          ...(state.currentModel !== modelId ? { explodeValue: 0 } : {}),
        })),

      setExplodeValue: (value) =>
        set({ explodeValue: Math.max(0, Math.min(1, value)) }),

      setSelectedPartId: (partId) =>
        set({ selectedPartId: partId }),

      togglePartVisibility: (partId) =>
        set((state) => ({
          visibleParts: state.visibleParts.includes(partId)
            ? state.visibleParts.filter((id) => id !== partId)
            : [...state.visibleParts, partId],
        })),

      setAllPartsVisible: (partIds) =>
        set({ visibleParts: partIds }),

      setHoveredPartId: (partId) =>
        set({ hoveredPartId: partId }),

      setNotes: (notes) =>
        set({ notes }),

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),

      resetViewer: () =>
        set({
          explodeValue: 0,
          selectedPartId: null,
          hoveredPartId: null,
        }),

      setGlobalOpacity: (value) =>
        set({ globalOpacity: Math.max(0, Math.min(1, value)) }),

      getModelState: (modelId: string) => {
        return get().modelStates[modelId];
      },

      setModelState: (modelId: string, state: Partial<ModelViewState>) =>
        set((prev) => ({
          modelStates: {
            ...prev.modelStates,
            [modelId]: {
              ...prev.modelStates[modelId],
              ...state,
            } as ModelViewState,
          },
        })),

      createPartGroup: (modelId: string, name: string, parentGroupId?: string | null) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          let groups = getGroups(ms);
          const newGroup: PartTreeGroup = {
            id: `group-${Date.now()}`,
            name,
            childPartIds: [],
            childGroupIds: [],
            parentGroupId: parentGroupId ?? null,
            collapsed: false,
          };
          // 부모 그룹이 있으면 childGroupIds에 추가
          if (parentGroupId) {
            groups = groups.map((g) =>
              g.id === parentGroupId
                ? { ...g, childGroupIds: [...g.childGroupIds, newGroup.id] }
                : g,
            );
          }
          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: [...groups, newGroup] } as ModelViewState,
            },
          };
        }),

      deletePartGroup: (modelId: string, groupId: string) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          let groups = getGroups(ms);
          const target = groups.find((g) => g.id === groupId);
          if (!target) return prev;

          const parentId = target.parentGroupId;

          // 하위 그룹의 parentGroupId를 삭제 대상의 부모로 변경
          groups = groups.map((g) =>
            target.childGroupIds.includes(g.id)
              ? { ...g, parentGroupId: parentId }
              : g,
          );

          // 하위 부품을 부모 그룹으로 이동
          if (parentId) {
            groups = groups.map((g) =>
              g.id === parentId
                ? {
                    ...g,
                    childPartIds: [...g.childPartIds, ...target.childPartIds],
                    childGroupIds: [
                      ...g.childGroupIds.filter((id) => id !== groupId),
                      ...target.childGroupIds,
                    ],
                  }
                : g,
            );
          } else {
            // 최상위로 이동: 부모의 childGroupIds에서 제거할 필요 없음 (부모 없음)
            // 하위 부품은 자동으로 미그룹이 됨
          }

          // 대상 그룹 제거
          groups = groups.filter((g) => g.id !== groupId);

          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: groups } as ModelViewState,
            },
          };
        }),

      renamePartGroup: (modelId: string, groupId: string, name: string) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          const groups = getGroups(ms).map((g) =>
            g.id === groupId ? { ...g, name } : g,
          );
          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: groups } as ModelViewState,
            },
          };
        }),

      movePartToGroup: (modelId: string, partId: string, groupId: string | null) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          let groups = getGroups(ms).map((g) => ({
            ...g,
            childPartIds: g.childPartIds.filter((id) => id !== partId),
          }));
          if (groupId) {
            groups = groups.map((g) =>
              g.id === groupId ? { ...g, childPartIds: [...g.childPartIds, partId] } : g,
            );
          }
          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: groups } as ModelViewState,
            },
          };
        }),

      toggleGroupCollapsed: (modelId: string, groupId: string) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          const groups = getGroups(ms).map((g) =>
            g.id === groupId ? { ...g, collapsed: !g.collapsed } : g,
          );
          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: groups } as ModelViewState,
            },
          };
        }),

      moveGroupToGroup: (modelId: string, sourceGroupId: string, targetGroupId: string | null) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          let groups = getGroups(ms);
          const source = groups.find((g) => g.id === sourceGroupId);
          if (!source) return prev;
          // 자기 자신으로 이동 방지
          if (sourceGroupId === targetGroupId) return prev;
          // 순환 참조 방지: target이 source의 자손이면 무시
          if (targetGroupId) {
            const descendants = collectDescendantGroupIds(groups, sourceGroupId);
            if (descendants.has(targetGroupId)) return prev;
          }

          const oldParentId = source.parentGroupId;

          // 이전 부모의 childGroupIds에서 제거
          if (oldParentId) {
            groups = groups.map((g) =>
              g.id === oldParentId
                ? { ...g, childGroupIds: g.childGroupIds.filter((id) => id !== sourceGroupId) }
                : g,
            );
          }

          // 새 부모의 childGroupIds에 추가
          if (targetGroupId) {
            groups = groups.map((g) =>
              g.id === targetGroupId
                ? { ...g, childGroupIds: [...g.childGroupIds, sourceGroupId] }
                : g,
            );
          }

          // source의 parentGroupId 업데이트
          groups = groups.map((g) =>
            g.id === sourceGroupId ? { ...g, parentGroupId: targetGroupId } : g,
          );

          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: groups } as ModelViewState,
            },
          };
        }),

      reorderGroups: (modelId: string, parentGroupId: string | null, orderedGroupIds: string[]) =>
        set((prev) => {
          const ms = prev.modelStates[modelId];
          let groups = getGroups(ms);

          if (parentGroupId) {
            // 부모 그룹의 childGroupIds 순서 교체
            groups = groups.map((g) =>
              g.id === parentGroupId ? { ...g, childGroupIds: orderedGroupIds } : g,
            );
          } else {
            // 최상위 그룹 순서 재배치: groups 배열 내에서 최상위 그룹의 상대 순서를 orderedGroupIds 순서로 변경
            const topLevelSet = new Set(orderedGroupIds);
            const nonTopLevel = groups.filter((g) => !topLevelSet.has(g.id));
            const reordered = orderedGroupIds
              .map((id) => groups.find((g) => g.id === id))
              .filter(Boolean) as PartTreeGroup[];
            groups = [...reordered, ...nonTopLevel];
          }

          return {
            modelStates: {
              ...prev.modelStates,
              [modelId]: { ...ms, partTreeGroups: groups } as ModelViewState,
            },
          };
        }),

      toggleControlsGuide: () =>
        set((state) => ({ showControlsGuide: !state.showControlsGuide })),
    }),
    {
      name: 'viewer-storage',
      partialize: (state) => ({
        notes: state.notes,
        isDarkMode: state.isDarkMode,
        explodeValue: state.explodeValue,
        currentModel: state.currentModel,
        globalOpacity: state.globalOpacity,
        modelStates: state.modelStates,
        showControlsGuide: state.showControlsGuide,
      }),
      skipHydration: true,
    }
  )
);
