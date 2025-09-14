import React, { useMemo } from 'react';
// 简化：改为原生拖拽，避免 React 错误 #300 的潜在冲突
import { useTags } from '../hooks/useTags';
import { useTagOrder } from '../hooks/useTagOrder';
import { styled } from '../stitches.config';
import { TagContext } from './tagEntry/TagContext';
import { TagEntry } from './tagEntry/TagEntry';
import { SimpleDraggableTagEntry } from './tagEntry/SimpleDraggableTagEntry';

const StyldTagList = styled('div', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
});

const ContextMenu = styled('div', {
  position: 'absolute',
  backgroundColor: '$elevation0',
  border: '1px solid $slate6',
  borderRadius: '$2',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  padding: '$2',
  zIndex: 9999,
  minWidth: '160px',
});

const MenuItem = styled('div', {
  padding: '$2 $3',
  cursor: 'pointer',
  borderRadius: '$1',
  '&:hover': { backgroundColor: '$elevation1' },
});

type Props = {
  filter: string;
  sortAscending: boolean;
  enableDragSort?: boolean;
  refresh?: number;
  applyExpand?: { version: number; expand: boolean };
};

export function TagList({ filter, sortAscending, enableDragSort = true, refresh = 0, applyExpand }: Props) {
  const tags = useTags();
  const { tagOrder, updateTagOrder, addTagToOrder } = useTagOrder();
  const [version, setVersion] = React.useState(0);
  const [menu, setMenu] = React.useState<{x:number;y:number;visible:boolean}>({x:0,y:0,visible:false});
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('logseq-plugin-tags-expanded');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('logseq-plugin-tags-expanded', JSON.stringify(expanded));
    } catch {}
  }, [expanded]);

  // 原生拖拽状态
  const activeIdRef = React.useRef<string | null>(null);
  const overIdRef = React.useRef<string | null>(null);
  const handleStart = (id: string) => { activeIdRef.current = id; };
  const handleOver = (id: string) => { overIdRef.current = id; };
  const handleDrop = (id: string) => {
    const active = activeIdRef.current;
    const over = id || overIdRef.current;
    if (enableDragSort && active && over && active !== over) {
      updateTagOrder(active, over);
    }
    activeIdRef.current = null;
    overIdRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // 只在列表空白区域触发（而不是单个条目内部）
    if (e.currentTarget === e.target) {
      e.preventDefault();
      setMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, visible: true });
    }
  };

  const expandOrCollapseAll = (expand: boolean) => {
    try {
      const tagNames = Object.keys(tags);
      const saved = localStorage.getItem('logseq-plugin-tags-expanded');
      const map = saved ? JSON.parse(saved) : {};
      tagNames.forEach(name => { map[name] = expand; });
      localStorage.setItem('logseq-plugin-tags-expanded', JSON.stringify(map));
      setVersion(v => v + 1); // 强制重挂载子项
    } catch {}
    setMenu(m => ({ ...m, visible: false }));
  };

  // 响应来自父组件的“全展开/全折叠”动作
  const appliedRef = React.useRef<number>(0);
  React.useEffect(() => {
    if (!applyExpand) return;
    if (appliedRef.current === applyExpand.version) return;
    appliedRef.current = applyExpand.version;
    expandOrCollapseAll(applyExpand.expand);
  }, [applyExpand]);

  // 获取排序后的标签列表
  const sortedTags = useMemo(() => {
    const tagNames = Object.keys(tags);
    
    // 确保所有标签都在排序列表中
    tagNames.forEach(tagName => {
      if (!tagOrder.includes(tagName)) {
        addTagToOrder(tagName);
      }
    });

    let sorted: string[];
    
    if (enableDragSort && tagOrder.length > 0) {
      // 使用自定义排序
      const orderedTags = tagOrder.filter(tagName => tagNames.includes(tagName));
      const unorderedTags = tagNames.filter(tagName => !tagOrder.includes(tagName));
      sorted = [...orderedTags, ...unorderedTags];
    } else {
      // 使用数量排序
      sorted = tagNames.sort((a, b) => {
        const diff = tags[b].length - tags[a].length;
        return sortAscending ? -diff : diff;
      });
    }

    // 应用过滤器
    return sorted.filter(tagName => {
      if (filter.trim() === '') return true;
      return tagName.toLowerCase().includes(filter.toLowerCase());
    });
  }, [tags, tagOrder, sortAscending, filter, enableDragSort, addTagToOrder, refresh]);

  return (
    <StyldTagList onContextMenu={handleContextMenu} onClick={() => menu.visible && setMenu({ ...menu, visible: false })}>
      {menu.visible && (
        <ContextMenu style={{ left: menu.x, top: menu.y }}>
          <MenuItem onClick={() => expandOrCollapseAll(true)}>Expand all</MenuItem>
          <MenuItem onClick={() => expandOrCollapseAll(false)}>Collapse all</MenuItem>
        </ContextMenu>
      )}
      {sortedTags.map(tagName => {
        const tag = { name: tagName, usages: tags[tagName] };
        return (
          <TagContext.Provider value={tag} key={`${tagName}-${version}-${refresh}`}>
            <SimpleDraggableTagEntry
              tag={tag}
              onDragStart={handleStart}
              onDragOver={handleOver}
              onDrop={handleDrop}
            />
          </TagContext.Provider>
        );
      })}
    </StyldTagList>
  );
}
