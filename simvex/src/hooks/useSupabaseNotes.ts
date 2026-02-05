'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useSupabaseNotes(user: User | null, modelId: string) {
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // DB에서 노트 로드
  useEffect(() => {
    if (!user || !modelId) {
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .single()
      .then(({ data }) => {
        if (data) setNotes(data.content || '');
        setLoaded(true);
      });
  }, [user, modelId]);

  // 1초 디바운스 저장
  const saveNotes = useCallback(
    (content: string) => {
      setNotes(content);

      if (!user || !modelId) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase.from('user_notes').upsert(
          {
            user_id: user.id,
            model_id: modelId,
            content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,model_id' }
        );
      }, 1000);
    },
    [user, modelId]
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return { notes, saveNotes, loaded };
}
