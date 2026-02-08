'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { ScrapRow, ScrapInput } from '@/types/scrap';

export function useScraps(user: User | null) {
  const [scraps, setScraps] = useState<ScrapRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 스크랩 목록 로드
  const fetchScraps = useCallback(async () => {
    if (!user) {
      setScraps([]);
      setLoaded(true);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from('model_scraps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setScraps(data ?? []);
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    fetchScraps();
  }, [fetchScraps]);

  // 스크랩 여부 확인 (로컬 상태 기반)
  const isScraped = useCallback(
    (modelType: 'builtin' | 'user', modelId: string): boolean => {
      return scraps.some((s) => s.model_type === modelType && s.model_id === modelId);
    },
    [scraps],
  );

  // 스크랩 추가
  const addScrap = useCallback(
    async (input: ScrapInput) => {
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('model_scraps')
        .insert({
          user_id: user.id,
          model_type: input.model_type,
          model_id: input.model_id,
          user_model_id: input.user_model_id ?? null,
        })
        .select()
        .single();
      if (!error && data) {
        setScraps((prev) => [data, ...prev]);
      }
    },
    [user],
  );

  // 스크랩 삭제
  const removeScrap = useCallback(
    async (modelType: 'builtin' | 'user', modelId: string) => {
      if (!user) return;
      const supabase = createClient();
      await supabase
        .from('model_scraps')
        .delete()
        .eq('user_id', user.id)
        .eq('model_type', modelType)
        .eq('model_id', modelId);
      setScraps((prev) => prev.filter((s) => !(s.model_type === modelType && s.model_id === modelId)));
    },
    [user],
  );

  // 토글 (스크랩 여부에 따라 추가/삭제)
  const toggleScrap = useCallback(
    async (input: ScrapInput) => {
      if (isScraped(input.model_type, input.model_id)) {
        await removeScrap(input.model_type, input.model_id);
      } else {
        await addScrap(input);
      }
    },
    [isScraped, addScrap, removeScrap],
  );

  return { scraps, loaded, addScrap, removeScrap, isScraped, toggleScrap };
}
