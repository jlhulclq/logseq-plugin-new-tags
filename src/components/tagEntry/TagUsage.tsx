import { QueryResultBlockEntity, QueryResultPageEntity } from 'logseqQueryResultTypes';
import React from 'react';
import { styled } from 'stitches.config';
import { useTheme } from '../../contexts/ThemeContext';

const UsageList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const UsageItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$2',
  padding: '$2',
  borderRadius: '$1',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '$elevation2',
  },
  // 修复深色模式下的错误背景色
  '.dark-theme &': {
    backgroundColor: 'transparent',
  },
  '.dark-theme &:hover': {
    backgroundColor: '$elevation2',
  },
});

const PageLink = styled('span', {
  color: 'hsl(152, 34%, 62%)', // 亮色主题下的链接色
  cursor: 'pointer',
  fontSize: '14px', // 与标签名称保持一致
  '&:hover': {
    textDecoration: 'underline',
  },
  '.dark-theme &': {
    color: '$slate11',
  },
});

const PagePath = styled('span', {
  color: '#FFFFFF',
  fontSize: '10px', // 更小的字体
  marginRight: '8px',
  padding: '1px 4px',
  backgroundColor: 'hsl(152, 34%, 62%)',
  borderRadius: '4px',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    filter: 'brightness(0.95)',
  },
  '.dark-theme &': {
    backgroundColor: 'transparent',
    color: '$slate11',
    border: '1px solid $slate7',
    letterSpacing: '0.5px',
  },
  
  variants: {
    theme: {
      simple: {
        display: 'none', // 简单主题下完全隐藏TXT标识
      },
    },
  },
});

const ContentText = styled('span', {
  color: '#000000',
  marginRight: '4px',
  fontSize: '14px', // 基准字体大小
  cursor: 'pointer',
  userSelect: 'none', // 防止文字被选中
  '.dark-theme &': {
    color: '$slate12',
  },
  
  variants: {
    theme: {
      simple: {
        color: '$slate12',
        '.dark-theme &': {
          color: '$slate11',
        },
      },
    },
  },
});

const Tag = styled('span', {
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: 'hsl(152, 34%, 62%)', // 使用指定的HSL颜色
  color: '#FFFFFF',
  fontSize: '12px', // 比正常文字小
  cursor: 'pointer',
  marginLeft: '4px',
  userSelect: 'none',
  '&:hover': {
    filter: 'brightness(0.95)',
  },
  '.dark-theme &': {
    backgroundColor: 'transparent',
    color: '$slate11',
    border: '1px solid $slate7',
  },
  
  variants: {
    theme: {
      simple: {
        backgroundColor: 'transparent',
        color: '$slate12',
        border: '1px solid $slate7',
        '.dark-theme &': {
          backgroundColor: 'transparent',
          color: '$slate11',
          border: '1px solid $slate7',
        },
      },
    },
  },
});

type Props = {
  usages: Array<QueryResultBlockEntity | QueryResultPageEntity>;
};

export function TagUsage({ usages }: Props) {
  const { isSimpleTheme } = useTheme();
  const handlePageClick = async (pageName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await logseq.App.pushState('page', { name: pageName });
  };

  const handleTagClick = async (tagName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await logseq.App.pushState('page', { name: tagName });
  };

  const handleTextSearch = async (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Searching for text:', text);

    // 修改查询语句，使用更简单的形式
    const query = `[:find (pull ?b [:block/uuid :block/content :block/page])
                   :where
                   [?b :block/content ?c]
                   [(clojure.string/includes? ?c "${text}")]]`;

    try {
      console.log('Executing query:', query);
      const results = await logseq.DB.datascriptQuery(query);
      console.log('Query results:', results);
      
      if (!results || results.length === 0) {
        console.log('No results found, opening search panel');
        await logseq.App.openSearch(text);
        return;
      }

      if (results.length === 1) {
        console.log('Single result found:', results[0][0]);
        const block = results[0][0];
        // 获取页面信息
        const page = await logseq.Editor.getPage(block.page.id);
        if (page) {
          console.log('Navigating to block in page:', page.name);
          await logseq.Editor.scrollToBlockInPage(page.name, block.uuid);
        } else {
          console.log('Page not found, opening search panel');
          await logseq.App.openSearch(text);
        }
      } else {
        console.log('Multiple results found:', results.length);
        await logseq.App.openSearch(text);
      }
    } catch (error) {
      console.error('Search failed:', error);
      await logseq.App.openSearch(text);
    }
  };

  // 文本截断函数
  const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const renderContent = (item: QueryResultBlockEntity | QueryResultPageEntity) => {
    // 获取内容并过滤掉任务状态标记
    let content = 'content' in item ? item.content : item.name;
    
    // 过滤掉 TODO/DOING/DONE/LATER 等任务状态标记
    content = content.replace(/^(TODO|DOING|DONE|LATER|NOW)\s+/i, '');
    
    // 过滤掉 logbook 内容
    content = content.replace(/\s*:LOGBOOK:[\s\S]*?:END:\s*/i, '');
    
    const elements: React.ReactNode[] = [];
    
    // 使用正则表达式匹配页面链接和标签
    const regex = /\[\[(.*?)\]\]|#(\S+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let hasPageLink = false;

    while ((match = regex.exec(content)) !== null) {
      // 添加匹配之前的文本
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index).trim();
        if (text) {
          if (!hasPageLink && !isSimpleTheme) {
            // 只在纯文本前添加txt标识（简单主题下不显示）
            elements.push(
              <PagePath 
                key="page-path" 
                onClick={(e) => handleTextSearch(text, e)}
                title="点击搜索文本"
              >
                TXT
              </PagePath>
            );
          }
          elements.push(
            <ContentText 
              key={`text-${lastIndex}`}
              onClick={(e) => handleTextSearch(text, e)}
              theme={isSimpleTheme ? 'simple' : undefined}
            >
              {truncateText(text)}
            </ContentText>
          );
        }
      }

      // 只添加页面链接，跳过标签
      if (match[1] !== undefined) {
        // 页面链接 [[...]]
        hasPageLink = true;
        const pageName = match[1];
        elements.push(
            
          <PageLink 
            key={`page-${match.index}`} 
            onClick={(e) => handlePageClick(pageName, e)}
          >
            {pageName}
          </PageLink>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // 添加剩余的文本
    if (lastIndex < content.length) {
      const text = content.slice(lastIndex).trim();
      if (text) {
        if (!hasPageLink && !isSimpleTheme) {
          // 只在纯文本前添加txt标识（简单主题下不显示）
          elements.push(
            <PagePath 
              key="page-path" 
              onClick={(e) => handleTextSearch(text, e)}
              title="点击搜索文本"
              theme={isSimpleTheme ? 'simple' : undefined}
            >
              TXT
            </PagePath>
          );
        }
        elements.push(
          <ContentText 
            key={`text-${lastIndex}`}
            onClick={(e) => handleTextSearch(text, e)}
            theme={isSimpleTheme ? 'simple' : undefined}
          >
            {truncateText(text)}
          </ContentText>
        );
      }
    }

    return elements;
  };

  return (
    <UsageList>
      {usages.map((item) => (
        <UsageItem key={item.uuid.$uuid$}>
          {renderContent(item)}
        </UsageItem>
      ))}
    </UsageList>
  );
} 