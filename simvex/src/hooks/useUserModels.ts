'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserModelRow, UserModelPartConfig, Visibility } from '@/types/userModel';

const BUCKET = 'user-models';

function getSupabase() {
  return createClient();
}

/** Storage 공개 URL 생성 */
export function getPublicUrl(path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function useUserModels(user: User | null) {
  const [models, setModels] = useState<UserModelRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 내 모델 목록 조회
  const fetchMyModels = useCallback(async () => {
    if (!user) {
      setModels([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from('user_models')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setModels(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMyModels();
  }, [fetchMyModels]);

  // 공개 모델 조회 (World에 표시)
  const fetchPublicModels = useCallback(async (limit = 6): Promise<UserModelRow[]> => {
    const supabase = getSupabase();
    // visibility 컬럼 우선 시도, 실패 시 is_public 사용
    const { data, error } = await supabase
      .from('user_models')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      const { data: fallback } = await supabase
        .from('user_models')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      return fallback ?? [];
    }
    return data ?? [];
  }, []);

  // 공개 모델 페이지네이션 조회 (visibility='public'만)
  const fetchPublicModelsPaginated = useCallback(
    async (page: number, pageSize = 12, search?: string): Promise<{ data: UserModelRow[]; count: number }> => {
      const supabase = getSupabase();
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('user_models')
        .select('*', { count: 'exact' });

      if (search && search.trim()) {
        const term = search.trim();
        // and()를 or() 안에 명시하여 visibility=public AND 검색어 일치 보장
        query = query.or(
          `and(visibility.eq.public,name.ilike.%${term}%),and(visibility.eq.public,description.ilike.%${term}%),and(visibility.eq.public,category.ilike.%${term}%)`
        );
      } else {
        query = query.eq('visibility', 'public');
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        // visibility 컬럼 미존재 시 is_public 폴백
        let fallbackQuery = supabase
          .from('user_models')
          .select('*', { count: 'exact' });

        if (search && search.trim()) {
          const term = search.trim();
          fallbackQuery = fallbackQuery.or(
            `and(is_public.eq.true,name.ilike.%${term}%),and(is_public.eq.true,description.ilike.%${term}%),and(is_public.eq.true,category.ilike.%${term}%)`
          );
        } else {
          fallbackQuery = fallbackQuery.eq('is_public', true);
        }

        const { data: fallback, count: fbCount } = await fallbackQuery
          .order('created_at', { ascending: false })
          .range(from, to);
        return { data: fallback ?? [], count: fbCount ?? 0 };
      }
      return { data: data ?? [], count: count ?? 0 };
    },
    []
  );

  // ID로 단일 모델 조회
  const fetchModelById = useCallback(async (id: string): Promise<UserModelRow | null> => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('user_models')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }, []);

  // 파일 업로드 + DB 레코드 생성
  const uploadModel = useCallback(
    async (params: {
      glbBlob: Blob;
      fbxBlob?: Blob;
      thumbnailBlob?: Blob;
      name: string;
      description: string;
      category: string;
      isPublic: boolean;
      partsConfig: UserModelPartConfig[];
      scale: number;
      cameraPosition: [number, number, number];
      cameraTarget: [number, number, number];
    }): Promise<UserModelRow> => {
      if (!user) throw new Error('로그인이 필요합니다');

      const supabase = getSupabase();
      const modelId = crypto.randomUUID();
      const basePath = `${user.id}/${modelId}`;

      // 1. GLB 업로드
      const glbPath = `${basePath}/model.glb`;
      const { error: glbError } = await supabase.storage
        .from(BUCKET)
        .upload(glbPath, params.glbBlob, {
          contentType: 'model/gltf-binary',
          upsert: true,
        });
      if (glbError) throw new Error(`GLB 업로드 실패: ${glbError.message}`);

      // 2. 썸네일 업로드 (선택)
      let thumbnailPath: string | null = null;
      if (params.thumbnailBlob) {
        thumbnailPath = `${basePath}/thumbnail.png`;
        await supabase.storage.from(BUCKET).upload(thumbnailPath, params.thumbnailBlob, {
          contentType: 'image/png',
          upsert: true,
        });
      }

      // 3. FBX 원본 업로드 (선택)
      let fbxPath: string | null = null;
      if (params.fbxBlob) {
        fbxPath = `${basePath}/original.fbx`;
        const { error: fbxError } = await supabase.storage
          .from(BUCKET)
          .upload(fbxPath, params.fbxBlob, {
            contentType: 'application/octet-stream',
            upsert: true,
          });
        if (fbxError) throw new Error(`FBX 업로드 실패: ${fbxError.message}`);
      }

      // 4. DB 레코드 생성
      const { data, error } = await supabase
        .from('user_models')
        .insert({
          id: modelId,
          user_id: user.id,
          name: params.name,
          description: params.description,
          category: params.category,
          is_public: params.isPublic,
          visibility: params.isPublic ? 'public' : 'private',
          glb_storage_path: glbPath,
          original_fbx_storage_path: fbxPath,
          thumbnail_storage_path: thumbnailPath,
          file_size_bytes: params.glbBlob.size,
          parts_config: params.partsConfig,
          scale: params.scale,
          camera_position: params.cameraPosition,
          camera_target: params.cameraTarget,
        })
        .select()
        .single();

      if (error) throw new Error(`모델 저장 실패: ${error.message}`);

      await fetchMyModels();
      return data;
    },
    [user, fetchMyModels]
  );

  // 모델 업데이트
  const updateModel = useCallback(
    async (
      id: string,
      updates: {
        name?: string;
        description?: string;
        category?: string;
        isPublic?: boolean;
        visibility?: Visibility;
        partsConfig?: UserModelPartConfig[];
        scale?: number;
        cameraPosition?: [number, number, number];
        cameraTarget?: [number, number, number];
        thumbnailBlob?: Blob;
      }
    ) => {
      if (!user) throw new Error('로그인이 필요합니다');

      const supabase = getSupabase();

      // 썸네일 교체
      let thumbnailPath: string | undefined;
      if (updates.thumbnailBlob) {
        thumbnailPath = `${user.id}/${id}/thumbnail.png`;
        await supabase.storage.from(BUCKET).upload(thumbnailPath, updates.thumbnailBlob, {
          contentType: 'image/png',
          upsert: true,
        });
      }

      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
      if (updates.visibility !== undefined) dbUpdates.visibility = updates.visibility;
      if (updates.partsConfig !== undefined) dbUpdates.parts_config = updates.partsConfig;
      if (updates.scale !== undefined) dbUpdates.scale = updates.scale;
      if (updates.cameraPosition !== undefined) dbUpdates.camera_position = updates.cameraPosition;
      if (updates.cameraTarget !== undefined) dbUpdates.camera_target = updates.cameraTarget;
      if (thumbnailPath !== undefined) dbUpdates.thumbnail_storage_path = thumbnailPath;

      const { error } = await supabase
        .from('user_models')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw new Error(`모델 업데이트 실패: ${error.message}`);
      await fetchMyModels();
    },
    [user, fetchMyModels]
  );

  // 모델 삭제 (Storage 파일 + DB 레코드)
  const deleteModel = useCallback(
    async (model: UserModelRow) => {
      if (!user) throw new Error('로그인이 필요합니다');

      const supabase = getSupabase();

      // Storage 파일 삭제
      const filesToDelete = [model.glb_storage_path];
      if (model.original_fbx_storage_path) filesToDelete.push(model.original_fbx_storage_path);
      if (model.thumbnail_storage_path) filesToDelete.push(model.thumbnail_storage_path);
      await supabase.storage.from(BUCKET).remove(filesToDelete);

      // DB 레코드 삭제
      const { error } = await supabase
        .from('user_models')
        .delete()
        .eq('id', model.id)
        .eq('user_id', user.id);

      if (error) throw new Error(`모델 삭제 실패: ${error.message}`);
      await fetchMyModels();
    },
    [user, fetchMyModels]
  );

  // 공개 상태 변경 (public / shared / private)
  const changeVisibility = useCallback(
    async (id: string, vis: Visibility) => {
      if (!user) return;
      const supabase = getSupabase();
      const isPublic = vis === 'public';

      // visibility 컬럼이 있으면 함께 업데이트, 없으면 is_public만
      const { error } = await supabase
        .from('user_models')
        .update({ is_public: isPublic, visibility: vis })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        // visibility 컬럼이 없는 경우 → is_public만 업데이트
        await supabase
          .from('user_models')
          .update({ is_public: isPublic })
          .eq('id', id)
          .eq('user_id', user.id);
      }

      await fetchMyModels();
    },
    [user, fetchMyModels]
  );

  // 공개 토글 (레거시 호환)
  const togglePublic = useCallback(
    async (id: string, isPublic: boolean) => {
      await changeVisibility(id, isPublic ? 'public' : 'private');
    },
    [changeVisibility]
  );

  return {
    models,
    loading,
    fetchMyModels,
    fetchPublicModels,
    fetchPublicModelsPaginated,
    fetchModelById,
    uploadModel,
    updateModel,
    deleteModel,
    togglePublic,
    changeVisibility,
  };
}
