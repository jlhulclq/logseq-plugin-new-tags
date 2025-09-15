import * as Collapsible from '@radix-ui/react-collapsible';
import React from 'react';
import { styled } from '../../stitches.config';
import { TagTreeNode } from '../../types';
import { TagEntry } from './TagEntry';

const NodeRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  borderRadius: '$1',
  cursor: 'pointer',
  '&:hover': { backgroundColor: '$elevation1' },
});

const Name = styled('span', {
  fontWeight: 500,
  color: '$slate12',
});

const Count = styled('span', {
  fontSize: '11px',
  color: '$slate11',
  backgroundColor: '$slate4',
  border: '1px solid $slate6',
  borderRadius: '10px',
  padding: '2px 6px',
});

type Props = {
  node: TagTreeNode;
  depth?: number;
};

export function TagTreeEntry({ node, depth = 0 }: Props) {
  const hasChildren = node.children.size > 0;
  const isLeaf = node.selfUsages.length > 0 && !hasChildren;

  if (isLeaf) {
    // 复用现有 TagEntry 渲染叶子（使用完整路径作为标签名）
    return <TagEntry tag={{ name: node.fullPath, usages: node.selfUsages }} />;
  }

  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <NodeRow>
          <Name>{node.name || 'Root'}</Name>
          <Count title="total usages in subtree">{node.totalCount}</Count>
        </NodeRow>
      </Collapsible.Trigger>
      <Collapsible.Content style={{ paddingLeft: 12 }}>
        {Array.from(node.children.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((child) => (
            <TagTreeEntry key={child.fullPath} node={child} depth={depth + 1} />
          ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}


