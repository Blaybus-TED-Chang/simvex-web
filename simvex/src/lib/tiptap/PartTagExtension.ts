import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PartTagComponent } from '@/components/notes/PartTagComponent';

export const PartTagExtension = Node.create({
  name: 'partTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      partId: { default: null },
      partName: { default: '' },
      modelId: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-part-tag]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-part-tag': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PartTagComponent);
  },
});
