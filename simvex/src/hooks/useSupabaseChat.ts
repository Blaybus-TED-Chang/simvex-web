'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useSupabaseChat(user: User | null, modelId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  // DB에서 대화 로드
  useEffect(() => {
    if (!user || !modelId) {
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from('chat_conversations')
      .select('messages')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .single()
      .then(({ data }) => {
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages as ChatMessage[]);
        }
        setLoaded(true);
      });
  }, [user, modelId]);

  // 대화 저장
  const saveMessages = useCallback(
    async (msgs: ChatMessage[]) => {
      setMessages(msgs);

      if (!user || !modelId) return;

      const supabase = createClient();
      await supabase.from('chat_conversations').upsert(
        {
          user_id: user.id,
          model_id: modelId,
          messages: msgs,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,model_id' }
      );
    },
    [user, modelId]
  );

  // 대화 초기화
  const clearMessages = useCallback(async () => {
    setMessages([]);

    if (!user || !modelId) return;

    const supabase = createClient();
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('model_id', modelId);
  }, [user, modelId]);

  return { messages, saveMessages, clearMessages, loaded };
}
