import * as Collapsible from '@radix-ui/react-collapsible';
import React, { useMemo, useState } from 'react';
import { styled } from 'stitches.config';
import { Tag } from 'types';
import { getTagColorTheme } from '../../utils';
import { TagUsage } from './TagUsage';

const StyledTag = styled(Collapsible.Root, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const TagButton = styled('button', {
  all: 'unset',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$2',
  paddingLeft: '0',
  borderRadius: '$2',
  cursor: 'pointer',
  color: '$slate12',
  backgroundColor: 'transparent',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '$elevation1',
  },
  '[data-state=open] &': {
    backgroundColor: 'hsla(var(--tag-hue), 34%, 95%, 0.5)',
  },
});

const IconWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  marginLeft: '$2',
  transition: 'all 0.2s',
  '[data-state=open] &': {
    backgroundColor: 'hsla(var(--tag-hue), 34%, 35%, 1) !important',
  },
});

const Chevron = styled('svg', {
  width: '12px',
  height: '12px',
  transition: 'transform 250ms, color 0.2s',
  '[data-state=open] &': {
    transform: 'rotate(90deg)',
  },
});

const TagName = styled('span', {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const TagNameText = styled('span', {
  padding: '$1 $3',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#FFFFFF',
  cursor: 'pointer',
  transition: 'all 0.2s',
  
  '[data-state=open] &': {
    backgroundColor: 'hsla(var(--tag-hue), 34%, 45%, 1) !important',
    filter: 'brightness(1.1)',
  },
});

const TagCount = styled('span', {
  padding: '2px 6px',
  borderRadius: '10px',
  color: '$slate11',
  fontSize: '11px',
  fontWeight: '500',
  userSelect: 'none',
  backgroundColor: '$slate4',
  border: '1px solid $slate6',
  transition: 'all 0.2s',
  
  '[data-state=open] &': {
    backgroundColor: 'hsla(var(--tag-hue), 34%, 50%, 0.1)',
    borderColor: 'hsla(var(--tag-hue), 34%, 50%, 0.3)',
    color: 'hsla(var(--tag-hue), 54%, 40%, 1)',
  },
});

const ContentWrapper = styled(Collapsible.Content, {
  paddingLeft: '24px',
});

type Props = {
  tag: Tag;
};

export function TagEntry({ tag }: Props) {
  const [usageOpen, setUsageOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('logseq-plugin-tags-expanded');
      const map = saved ? JSON.parse(saved) : {};
      return Boolean(map[tag.name]);
    } catch {
      return false;
    }
  });
  
  // 获取标签的颜色主题
  const colorTheme = useMemo(() => getTagColorTheme(tag.name), [tag.name]);
  
  // 从颜色中提取色相值
  const hue = useMemo(() => {
    const match = colorTheme.light.match(/hsl\((\d+)/);
    return match ? match[1] : '0';
  }, [colorTheme]);

  const handleOpenPage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logseq.App.pushState('page', { name: tag.name });
  };

  // 持久化展开状态
  const handleOpenChange = (open: boolean) => {
    setUsageOpen(open);
    try {
      const saved = localStorage.getItem('logseq-plugin-tags-expanded');
      const map = saved ? JSON.parse(saved) : {};
      map[tag.name] = open;
      localStorage.setItem('logseq-plugin-tags-expanded', JSON.stringify(map));
    } catch {}
  };

  return (
    <StyledTag open={usageOpen} onOpenChange={handleOpenChange}>
      <Collapsible.Trigger asChild>
        <TagButton style={{ '--tag-hue': hue } as any}>
          <IconWrapper style={{ backgroundColor: colorTheme.regular }}>
            <Chevron viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 4l4 4-4 4" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Chevron>
          </IconWrapper>
          <TagName>
            <TagNameText
              style={{ backgroundColor: colorTheme.regular }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPage(e);
              }}
              title="在新页面中打开标签"
            >
              {tag.name}
            </TagNameText>
          </TagName>
          <TagCount>
            {tag.usages.length}
          </TagCount>
        </TagButton>
      </Collapsible.Trigger>
      <ContentWrapper>
        <TagUsage usages={tag.usages} />
      </ContentWrapper>
    </StyledTag>
  );
}
