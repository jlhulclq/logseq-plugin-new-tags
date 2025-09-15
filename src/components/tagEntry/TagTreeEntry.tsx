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
  borderRadius: '$2',
  cursor: 'default',
  backgroundColor: '$elevation1',
});

const Name = styled('button', {
  all: 'unset',
  fontWeight: 600,
  color: '$slate12',
  backgroundColor: '$slate7',
  borderRadius: '20px',
  padding: '4px 10px',
  cursor: 'pointer',
});

const Count = styled('span', {
  fontSize: '11px',
  color: '$slate11',
  backgroundColor: '$slate4',
  border: '1px solid $slate6',
  borderRadius: '10px',
  padding: '2px 6px',
});

const ArrowBtn = styled('button', {
  all: 'unset',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: '$slate7',
  color: '#fff',
  cursor: 'pointer',
});

type Props = {
  node: TagTreeNode;
  depth?: number;
};

export function TagTreeEntry({ node, depth = 0 }: Props) {
  const hasChildren = node.children.size > 0;
  const isLeaf = node.selfUsages.length > 0 && !hasChildren;

  if (isLeaf) {
    // 叶子：显示末段名
    return <TagEntry tag={{ name: node.fullPath, usages: node.selfUsages }} displayName={node.name} />;
  }

  return (
    <Collapsible.Root>
      <NodeRow>
        <Collapsible.Trigger asChild>
          <ArrowBtn title="展开/折叠">▶</ArrowBtn>
        </Collapsible.Trigger>
        <Name
          title="打开标签页"
          onClick={(e) => {
            e.stopPropagation();
            logseq.App.pushState('page', { name: node.fullPath });
          }}
        >
          {node.name || 'Root'}
        </Name>
        <div style={{ flex: 1 }} />
        <Count title="total usages in subtree">{node.totalCount}</Count>
      </NodeRow>
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


