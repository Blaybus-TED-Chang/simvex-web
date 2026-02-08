'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AnnotationRow, AnnotationInput } from '@/types/annotation';

export function useAnnotations(user: User | null, modelId: string) {
  const [annotations, setAnnotations] = useState<AnnotationRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // DB에서 주석 로드
  useEffect(() => {
    if (!user || !modelId) {
      setAnnotations([]);
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from('annotations')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (data) setAnnotations(data as AnnotationRow[]);
        setLoaded(true);
      });
  }, [user, modelId]);

  // 주석 생성
  const createAnnotation = useCallback(
    async (input: AnnotationInput): Promise<AnnotationRow | null> => {
      if (!user) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('annotations')
        .insert({
          user_id: user.id,
          model_id: input.model_id,
          target_type: input.target_type,
          part_id: input.part_id || null,
          position: input.position,
          title: input.title,
          content: input.content,
          color: input.color || '#3B82F6',
        })
        .select()
        .single();

      if (data) {
        const row = data as AnnotationRow;
        setAnnotations((prev) => [...prev, row]);
        return row;
      }
      return null;
    },
    [user]
  );

  // 주석 수정
  const updateAnnotation = useCallback(
    async (id: string, updates: Partial<Pick<AnnotationRow, 'title' | 'content' | 'color'>>) => {
      if (!user) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('annotations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (data) {
        const row = data as AnnotationRow;
        setAnnotations((prev) => prev.map((a) => (a.id === id ? row : a)));
      }
    },
    [user]
  );

  // 주석 삭제
  const deleteAnnotation = useCallback(
    async (id: string) => {
      if (!user) return;

      const supabase = createClient();
      await supabase
        .from('annotations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    },
    [user]
  );

  return { annotations, loaded, createAnnotation, updateAnnotation, deleteAnnotation };
}
