'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { NoteItem } from '@/types/note';
import type { JSONContent } from '@tiptap/react';

export function useNotes(user: User | null, modelId: string) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 노트 목록 조회
  const fetchNotes = useCallback(async () => {
    if (!user || !modelId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('user_notes_v2')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .order('updated_at', { ascending: false });
    if (data) {
      setNotes(data.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content as JSONContent,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })));
    }
    setLoaded(true);
  }, [user, modelId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // 노트 생성
  const createNote = useCallback(async (): Promise<NoteItem | null> => {
    if (!user || !modelId) return null;
    const supabase = createClient();
    const { data } = await supabase
      .from('user_notes_v2')
      .insert({ user_id: user.id, model_id: modelId, title: '제목 없음', content: {} })
      .select()
      .single();
    if (data) {
      const newNote: NoteItem = {
        id: data.id,
        title: data.title,
        content: data.content as JSONContent,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    }
    return null;
  }, [user, modelId]);

  // 노트 업데이트 (디바운스 1초)
  const updateNote = useCallback((id: string, updates: { title?: string; content?: JSONContent }) => {
    if (!user) return;

    // 로컬 상태 즉시 업데이트
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );

    // 디바운스된 서버 업데이트
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase
        .from('user_notes_v2')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
    }, 1000);
  }, [user]);

  // 노트 삭제
  const deleteNote = useCallback(async (id: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from('user_notes_v2')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [user]);

  return { notes, loaded, createNote, updateNote, deleteNote };
}
