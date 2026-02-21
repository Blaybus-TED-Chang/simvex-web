import type { JSONContent } from '@tiptap/react';

export interface NoteItem {
  id: string;
  title: string;
  content: JSONContent;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  partRefs?: string[];
}
