import React from 'react';
import { styled } from '../../stitches.config';
import { Tag } from '../../types';
import { TagEntry } from './TagEntry';

const Row = styled('div', {
  userSelect: 'none',
});

type Props = {
  tag: Tag;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
};

export function SimpleDraggableTagEntry({ tag, onDragStart, onDragOver, onDrop }: Props) {
  return (
    <Row
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tag.name);
        onDragStart(tag.name);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(tag.name);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const active = e.dataTransfer.getData('text/plain') || tag.name;
        if (active) onDrop(tag.name);
      }}
    >
      <TagEntry tag={tag} />
    </Row>
  );
}


