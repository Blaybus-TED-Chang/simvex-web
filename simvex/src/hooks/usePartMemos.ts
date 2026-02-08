'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface PartMemo {
  id: string;
  partId: string;
  content: string;
  screenshotPath: string;
  screenshotUrl: string;
  createdAt: string;
}

export function usePartMemos(user: User | null, modelId: string) {
  const [memos, setMemos] = useState<PartMemo[]>([]);
  const [loading, setLoading] = useState(false);

  // DB에서 메모 로드
  useEffect(() => {
    if (!user || !modelId) {
      setMemos([]);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    supabase
      .from('part_memos')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setMemos(
            data.map((row) => {
              const { data: urlData } = supabase.storage
                .from('part-memos')
                .getPublicUrl(row.screenshot_path);
              return {
                id: row.id,
                partId: row.part_id,
                content: row.content,
                screenshotPath: row.screenshot_path,
                screenshotUrl: urlData.publicUrl,
                createdAt: row.created_at,
              };
            })
          );
        }
        setLoading(false);
      });
  }, [user, modelId]);

  // 메모 생성
  const createMemo = useCallback(
    async (partId: string, content: string, screenshotBlob: Blob) => {
      if (!user || !modelId) return;

      const supabase = createClient();

      // 1. 임시 ID 생성
      const tempId = crypto.randomUUID();
      const storagePath = `${user.id}/${modelId}/${tempId}.jpg`;

      // 2. 스크린샷 업로드
      const { error: uploadError } = await supabase.storage
        .from('part-memos')
        .upload(storagePath, screenshotBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('스크린샷 업로드 실패:', uploadError);
        return;
      }

      // 3. 메모 레코드 INSERT
      const { data, error } = await supabase
        .from('part_memos')
        .insert({
          user_id: user.id,
          model_id: modelId,
          part_id: partId,
          content,
          screenshot_path: storagePath,
        })
        .select()
        .single();

      if (error) {
        console.error('메모 저장 실패:', error);
        return;
      }

      if (data) {
        const { data: urlData } = supabase.storage
          .from('part-memos')
          .getPublicUrl(storagePath);

        const newMemo: PartMemo = {
          id: data.id,
          partId: data.part_id,
          content: data.content,
          screenshotPath: data.screenshot_path,
          screenshotUrl: urlData.publicUrl,
          createdAt: data.created_at,
        };
        setMemos((prev) => [newMemo, ...prev]);
      }
    },
    [user, modelId]
  );

  // 메모 삭제
  const deleteMemo = useCallback(
    async (id: string, screenshotPath: string) => {
      if (!user) return;

      const supabase = createClient();

      // Storage에서 파일 삭제
      await supabase.storage.from('part-memos').remove([screenshotPath]);

      // 테이블에서 DELETE
      await supabase.from('part_memos').delete().eq('id', id);

      setMemos((prev) => prev.filter((m) => m.id !== id));
    },
    [user]
  );

  return { memos, createMemo, deleteMemo, loading };
}
