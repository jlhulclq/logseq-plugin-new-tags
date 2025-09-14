import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { styled } from '../../stitches.config';
import { Tag } from '../../types';
import { TagEntry } from './TagEntry';

const SortableWrapper = styled('div', {
  transition: 'transform 200ms ease',
  
  '&.sorting': {
    zIndex: 1000,
  },
  
  '&.dragging': {
    opacity: 0.5,
  },
});

const DragHandle = styled('div', {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: '12px',
  cursor: 'grab',
  backgroundColor: 'transparent',
  transition: 'background-color 0.2s',
  borderRadius: '$1 0 0 $1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '&:hover': {
    backgroundColor: '$slate4',
  },
  
  '&:active': {
    cursor: 'grabbing',
    backgroundColor: '$slate5',
  },
  
  '&::before': {
    content: '"⋮⋮"',
    fontSize: '8px',
    color: '$slate9',
    lineHeight: 1,
    letterSpacing: '-2px',
    opacity: 0.6,
    transform: 'rotate(90deg)',
  },
  
  '&:hover::before': {
    opacity: 1,
    color: '$slate11',
  },
});

type Props = {
  tag: Tag;
};

export function SortableTagEntry({ tag }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableWrapper
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dragging' : ''}
    >
      <div style={{ position: 'relative' }}>
        <DragHandle {...attributes} {...listeners} />
        <div style={{ paddingLeft: '16px' }}>
          <TagEntry tag={tag} />
        </div>
      </div>
    </SortableWrapper>
  );
}
