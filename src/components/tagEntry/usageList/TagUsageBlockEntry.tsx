import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user';
import { Box } from 'components/Box';
import { Mark, Paragraph, Text } from 'components/Text';
import { QueryResultBlockEntity } from 'logseqQueryResultTypes';
import React, { useContext, useEffect, useState } from 'react';
import { escapeRegExp } from 'utils';
import { commonEntryStyle } from '.';
import { TagContext } from '../TagContext';
import { styled } from 'stitches.config';

const TagBadge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '1px 6px',
  borderRadius: '10px',
  fontSize: '12px',
  backgroundColor: 'hsl(152, 33%, 60%)',
  color: '#FFFFFF',
  marginLeft: '6px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'hsl(152, 33%, 55%)',
  }
});

const PageLink = styled('span', {
  cursor: 'pointer',
  color: 'hsl(152, 33%, 60%)',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  }
});

const NormalText = styled('span', {
  color: '#333333',
});

const ContentContainer = styled('div', {
  marginTop: '2px',
  paddingLeft: '8px',
  borderLeft: '2px solid hsl(152, 33%, 60%)',
});

type Props = {
  block: QueryResultBlockEntity;
};

// 提取双链引用
function extractReferences(content: string): { text: string; isRef: boolean; refName?: string }[] {
  const parts: { text: string; isRef: boolean; refName?: string }[] = [];
  let lastIndex = 0;
  const regex = /\[\[(.*?)\]\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, match.index), isRef: false });
    }
    // 添加双链引用
    parts.push({ text: match[0], isRef: true, refName: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // 添加剩余的文本
  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex), isRef: false });
  }

  return parts;
}

export const TagUsageBlockEntry = React.memo(({ block }: Props) => {
  const { name } = useContext(TagContext);
  const [containingPage, setContainingPage] = useState<PageEntity | null>(null);
  const [parentBlock, setParentBlock] = useState<BlockEntity | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        const [page, parent] = await Promise.all([
          logseq.Editor.getPage(block.page.id),
          logseq.Editor.getBlock(block.parent.id)
        ]);
        if (mounted) {
          setContainingPage(page);
          setParentBlock(parent);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [block.page.id, block.parent.id]);

  const escapedTag = escapeRegExp(name);
  const contentSplittedByTagName = block.content.split(
    new RegExp(`(#${escapedTag}|#\\[\\[${escapedTag}\\]\\])`, 'gi'),
  );

  const hasParentBlock = block.parent.id !== block.page.id;

  // 处理点击事件
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    const refElement = target.closest('[data-ref-name]');
    const tagElement = target.closest('[data-tag-name]');
    
    // 如果点击的是标签
    if (tagElement && tagElement.getAttribute('data-tag-name')) {
      const tagName = tagElement.getAttribute('data-tag-name');
      await logseq.App.pushState('page', { name: tagName });
      return;
    }
    
    // 如果点击的是双链引用
    if (refElement && refElement.getAttribute('data-ref-name')) {
      const refName = refElement.getAttribute('data-ref-name');
      await logseq.App.pushState('page', { name: refName });
      return;
    }
    
    // 否则执行默认的跳转到块的行为
    if (containingPage != null) {
      await logseq.Editor.scrollToBlockInPage(containingPage.name, block.uuid['$uuid$']);
    }
  };

  const handleRefClick = async (refName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await logseq.App.pushState('page', { name: refName });
  };

  const handleTagClick = async (tagName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await logseq.App.pushState('page', { name: tagName });
  };

  const renderContent = () => {
    return contentSplittedByTagName.map((value, index) => {
      if (value.toLowerCase() === `#${name}` || value.toLowerCase() === `#[[${name}]]`) {
        return (
          <TagBadge
            key={index}
            data-tag-name={name}
            onClick={(e) => handleTagClick(name, e)}
          >
            #{name}
          </TagBadge>
        );
      }
      // 处理可能包含双链引用的文本
      const parts = extractReferences(value);
      return parts.map((part, partIndex) => {
        if (part.isRef) {
          return (
            <PageLink
              key={`${index}-${partIndex}`}
              data-ref-name={part.refName}
              onClick={(e) => handleRefClick(part.refName!, e)}
            >
              {part.refName}
            </PageLink>
          );
        }
        return <NormalText key={`${index}-${partIndex}`}>{part.text}</NormalText>;
      });
    });
  };

  return (
    <div
      className={commonEntryStyle()}
      onClick={handleClick}
      style={{ 
        cursor: 'pointer', 
        padding: '4px 8px', 
        marginBottom: '2px',
      }}
    >
      <Box
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflow: 'hidden',
        }}
      >
        <ContentContainer>
          <Paragraph size='2' css={{ margin: 0 }}>
            {renderContent()}
          </Paragraph>
        </ContentContainer>
      </Box>
    </div>
  );
});
