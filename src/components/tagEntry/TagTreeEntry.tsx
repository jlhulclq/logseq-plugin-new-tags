import * as Collapsible from '@radix-ui/react-collapsible';
import React, { useState, useMemo } from 'react';
import { styled } from '../../stitches.config';
import { TagTreeNode } from '../../types';
import { TagEntry } from './TagEntry';
import { getTagColorTheme } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';

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
  
  variants: {
    expanded: {
      true: {
        // 彩色主题下的展开背景
        backgroundColor: 'hsla(var(--tag-hue), 34%, 95%, 0.5)',
        '.dark-theme &': {
          backgroundColor: '$slate4',
        },
      },
    },
    theme: {
      simple: {
        // 简单主题下的展开背景
        '&[data-expanded=true]': {
          backgroundColor: '$slate3',
        },
        '.dark-theme &[data-expanded=true]': {
          backgroundColor: '$slate6',
        },
      },
    },
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
  '.dark-theme &[data-state=open]': {
    backgroundColor: '$slate7 !important',
  },
  
  variants: {
    theme: {
      simple: {
        backgroundColor: 'transparent !important',
        '[data-state=open] &': {
          backgroundColor: 'transparent !important',
        },
        '.dark-theme &': {
          backgroundColor: 'transparent !important',
        },
        '.dark-theme &[data-state=open]': {
          backgroundColor: 'transparent !important',
        },
      },
    },
  },
});

const Chevron = styled('svg', {
  width: '12px',
  height: '12px',
  transition: 'transform 250ms, color 0.2s',
  
  variants: {
    theme: {
      simple: {
        '& path': {
          stroke: '$slate12 !important',
        },
        '.dark-theme & path': {
          stroke: '$slate11 !important',
        },
      },
    },
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
  '.dark-theme &': {
    backgroundColor: '$slate7 !important',
    color: '$slate12',
  },
  '.dark-theme &[data-state=open]': {
    backgroundColor: '$slate7 !important',
    filter: 'none',
  },
  
  variants: {
    theme: {
      simple: {
        backgroundColor: 'transparent !important',
        color: '$slate12',
        border: 'none !important',
        borderRadius: '0 !important',
        padding: '0 !important',
        '&:hover': {
          textDecoration: 'underline',
        },
        '[data-state=open] &': {
          backgroundColor: 'transparent !important',
          border: 'none !important',
          filter: 'none',
          fontWeight: '600',
        },
        '.dark-theme &': {
          backgroundColor: 'transparent !important',
          color: '$slate11',
          border: 'none !important',
        },
        '.dark-theme &[data-state=open]': {
          backgroundColor: 'transparent !important',
          border: 'none !important',
          color: '$slate12',
          fontWeight: '600',
        },
      },
    },
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
  '.dark-theme &[data-state=open]': {
    backgroundColor: '$slate4',
    borderColor: '$slate6',
    color: '$slate11',
  },
  
  variants: {
    theme: {
      simple: {
        backgroundColor: 'transparent !important',
        border: 'none !important',
        color: '$slate11',
        padding: '0 !important',
        borderRadius: '0 !important',
        '[data-state=open] &': {
          backgroundColor: 'transparent !important',
          border: 'none !important',
          color: '$slate11',
        },
        '.dark-theme &': {
          backgroundColor: 'transparent !important',
          border: 'none !important',
          color: '$slate10',
        },
        '.dark-theme &[data-state=open]': {
          backgroundColor: 'transparent !important',
          border: 'none !important',
          color: '$slate10',
        },
      },
    },
  },
});

const ContentWrapper = styled(Collapsible.Content, {
  paddingLeft: '24px',
});

type Props = {
  node: TagTreeNode;
  depth?: number;
};

export function TagTreeEntry({ node, depth = 0 }: Props) {
  const { isSimpleTheme } = useTheme();
  const hasChildren = node.children.size > 0;
  const hasContent = node.selfUsages.length > 0;
  
  // 叶子节点：没有子节点
  if (!hasChildren) {
    // 叶子节点：使用 TagEntry 渲染，显示末段名，禁用展开背景
    return (
      <TagEntry 
        tag={{ name: node.fullPath, usages: node.selfUsages }} 
        displayName={node.name}
      />
    );
  }
  
  const [usageOpen, setUsageOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('logseq-plugin-tags-expanded');
      const map = saved ? JSON.parse(saved) : {};
      return Boolean(map[node.fullPath]);
    } catch {
      return false;
    }
  });
  
  const colorTheme = useMemo(() => getTagColorTheme(node.fullPath), [node.fullPath]);
  const hue = useMemo(() => {
    const match = colorTheme.light.match(/hsl\((\d+)/);
    return match ? match[1] : '0';
  }, [colorTheme]);

  const handleOpenChange = (open: boolean) => {
    setUsageOpen(open);
    try {
      const saved = localStorage.getItem('logseq-plugin-tags-expanded');
      const map = saved ? JSON.parse(saved) : {};
      map[node.fullPath] = open;
      localStorage.setItem('logseq-plugin-tags-expanded', JSON.stringify(map));
    } catch {}
  };

  const handleOpenPage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logseq.App.pushState('page', { name: node.fullPath });
  };

  // 非叶子节点：有子节点，需要展开/折叠功能

  return (
    <StyledTag open={usageOpen} onOpenChange={handleOpenChange}>
      <Collapsible.Trigger asChild>
        <TagButton 
          style={{ '--tag-hue': hue } as any}
          theme={isSimpleTheme ? 'simple' : undefined}
          expanded={usageOpen}
          data-expanded={usageOpen}
        >
          <IconWrapper 
            style={{ backgroundColor: isSimpleTheme ? 'transparent' : colorTheme.regular }}
            theme={isSimpleTheme ? 'simple' : undefined}
          >
            <Chevron 
              viewBox="0 0 16 16" 
              aria-hidden="true"
              style={{ 
                transform: usageOpen ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
              theme={isSimpleTheme ? 'simple' : undefined}
            >
              <path 
                d="M6 4l4 4-4 4" 
                fill="none" 
                stroke={isSimpleTheme ? 'currentColor' : '#FFFFFF'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </Chevron>
          </IconWrapper>
          <TagName>
            <TagNameText
              style={{ 
                backgroundColor: isSimpleTheme ? 'transparent !important' : colorTheme.regular,
                border: isSimpleTheme ? 'none !important' : undefined,
                borderRadius: isSimpleTheme ? '0 !important' : undefined,
                padding: isSimpleTheme ? '0 !important' : undefined
              }}
              theme={isSimpleTheme ? 'simple' : undefined}
              onClick={handleOpenPage}
              title="在新页面中打开标签"
            >
              {node.name || 'Root'}
            </TagNameText>
          </TagName>
          <TagCount theme={isSimpleTheme ? 'simple' : undefined}>
            {node.totalCount}
          </TagCount>
        </TagButton>
      </Collapsible.Trigger>
      <ContentWrapper>
        {Array.from(node.children.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((child) => (
            <TagTreeEntry key={child.fullPath} node={child} depth={depth + 1} />
          ))}
      </ContentWrapper>
    </StyledTag>
  );
}


