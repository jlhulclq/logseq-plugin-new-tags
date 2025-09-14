import React from 'react';
import { useTags } from '../hooks/useTags';
import { styled } from '../stitches.config';
import { TagContext } from './tagEntry/TagContext';
import { TagEntry } from './tagEntry/TagEntry';

const StyldTagList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
});

type Props = {
  filter: string;
  sortAscending: boolean;
  enableDragSort?: boolean;
};

export function LazyTagList({ filter, sortAscending }: Props) {
  const tags = useTags();

  // 添加安全检查
  if (!tags || typeof tags !== 'object') {
    return <StyldTagList />;
  }

  const tagEntries = Object.keys(tags)
    .filter(tagName => {
      // 确保tagName是字符串且tags[tagName]是数组
      if (typeof tagName !== 'string' || !Array.isArray(tags[tagName])) {
        return false;
      }
      if (filter.trim() === '') return true;
      return tagName.toLowerCase().includes(filter.toLowerCase());
    })
    .sort((a, b) => {
      const aLength = tags[a]?.length || 0;
      const bLength = tags[b]?.length || 0;
      const diff = bLength - aLength;
      return sortAscending ? -diff : diff;
    })
    .map(tagName => {
      const tag = { name: tagName, usages: tags[tagName] || [] };
      return (
        <TagContext.Provider value={tag} key={`tag-${tagName}`}>
          <TagEntry tag={tag} />
        </TagContext.Provider>
      );
    });

  return (
    <StyldTagList>
      {tagEntries}
    </StyldTagList>
  );
}
