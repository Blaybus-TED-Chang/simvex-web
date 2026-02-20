'use client';

import { useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { useNotes } from '@/hooks/useNotes';
import { useNoteImages } from '@/hooks/useNoteImages';
import { LoginRequired } from './LoginRequired';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';

interface NotesPanelProps {
  modelId: string;
  modelNameKo?: string;
  user: User | null;
  isDarkMode: boolean;
  selectedPartId: string | null;
  selectedPartName: string | null;
  onSelectPart: (partId: string | null) => void;
}

export function NotesPanel({
  modelId,
  modelNameKo,
  user,
  isDarkMode,
  selectedPartId,
  selectedPartName,
}: NotesPanelProps) {
  const { notes, createNote, updateNote, deleteNote } = useNotes(user, modelId);
  const { uploadImage } = useNoteImages(user);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    const note = await createNote();
    if (note) setActiveNoteId(note.id);
  }, [createNote]);

  const handleUploadImage = useCallback(async (file: File) => {
    if (!activeNoteId) return null;
    return await uploadImage(file, activeNoteId);
  }, [uploadImage, activeNoteId]);

  // 비로그인
  if (!user) {
    return <LoginRequired isDarkMode={isDarkMode} />;
  }

  // 에디터 모드
  const activeNote = notes.find((n) => n.id === activeNoteId);
  if (activeNoteId && activeNote) {
    return (
      <NoteEditor
        note={activeNote}
        isDarkMode={isDarkMode}
        modelId={modelId}
        modelNameKo={modelNameKo}
        selectedPartId={selectedPartId}
        selectedPartName={selectedPartName}
        onUpdate={updateNote}
        onBack={() => setActiveNoteId(null)}
        onUploadImage={handleUploadImage}
      />
    );
  }

  // 목록 모드
  return (
    <NotesList
      notes={notes}
      isDarkMode={isDarkMode}
      onCreate={handleCreate}
      onSelect={setActiveNoteId}
      onDelete={deleteNote}
    />
  );
}
