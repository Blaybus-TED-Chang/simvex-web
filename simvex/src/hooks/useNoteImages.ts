'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useNoteImages(user: User | null) {
  const uploadImage = useCallback(async (file: File, noteId: string): Promise<string | null> => {
    if (!user) return null;
    const supabase = createClient();
    const ts = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${noteId}/${ts}-${safeName}`;

    const { error } = await supabase.storage
      .from('note-images')
      .upload(path, file);

    if (error) {
      console.error('이미지 업로드 실패:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('note-images')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }, [user]);

  return { uploadImage };
}
