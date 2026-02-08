'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface PartCustomization {
  color?: string;
  nameKo?: string;
}

export function usePartCustomizations(user: User | null, modelId: string) {
  const [customizations, setCustomizations] = useState<Record<string, PartCustomization>>({});
  const [loaded, setLoaded] = useState(false);

  // DB에서 커스터마이징 로드
  useEffect(() => {
    if (!user || !modelId) {
      setCustomizations({});
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from('part_customizations')
      .select('part_id, custom_color, custom_name_ko')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, PartCustomization> = {};
          for (const row of data) {
            map[row.part_id] = {
              color: row.custom_color ?? undefined,
              nameKo: row.custom_name_ko ?? undefined,
            };
          }
          setCustomizations(map);
        }
        setLoaded(true);
      });
  }, [user, modelId]);

  // UPSERT 커스터마이징
  const upsertCustomization = useCallback(
    async (partId: string, updates: PartCustomization) => {
      if (!user || !modelId) return;

      // 로컬 즉시 반영
      setCustomizations((prev) => ({
        ...prev,
        [partId]: { ...prev[partId], ...updates },
      }));

      const supabase = createClient();
      await supabase.from('part_customizations').upsert(
        {
          user_id: user.id,
          model_id: modelId,
          part_id: partId,
          ...(updates.color !== undefined && { custom_color: updates.color }),
          ...(updates.nameKo !== undefined && { custom_name_ko: updates.nameKo }),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,model_id,part_id' }
      );
    },
    [user, modelId]
  );

  // 원본 복원 (행 삭제)
  const resetCustomization = useCallback(
    async (partId: string) => {
      if (!user || !modelId) return;

      setCustomizations((prev) => {
        const next = { ...prev };
        delete next[partId];
        return next;
      });

      const supabase = createClient();
      await supabase
        .from('part_customizations')
        .delete()
        .eq('user_id', user.id)
        .eq('model_id', modelId)
        .eq('part_id', partId);
    },
    [user, modelId]
  );

  return { customizations, upsertCustomization, resetCustomization, loaded };
}
