import { AppUserConfigs } from '@logseq/libs/dist/LSPlugin';
import { Input } from 'components/Input';
import { useThemeMode } from 'hooks/useThemeMode';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import foldIcon from '../fold-svgrepo-com.svg';
import { TagList } from './components/TagList';
import { useAppVisible } from './hooks/useAppVisible';
import { usePluginSettings } from './hooks/usePluginSettings';
import { css, darkTheme } from './stitches.config';

const body = css({
  position: 'relative',
  height: '100%',

  '& ::-webkit-scrollbar': {
    width: '6px',
  },
  '& ::-webkit-scrollbar-corner': {
    background: '0 0',
  },
  '& ::-webkit-scrollbar-thumb': {
    backgroundColor: '$interactiveBorder',
  },
});

const app = css({
  position: 'absolute',
  top: 'calc(48px + $4)',
  bottom: '$2',
  right: '$4',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  backgroundColor: '$elevation0',
  borderRadius: '$2',
  padding: '$4',
  maxWidth: '50%',
  overflow: 'auto',
  minWidth: '180px',
  // 固定高度下内部滚动，且禁止原生 resize
  resize: 'none',
  borderLeft: '4px solid transparent',

  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  variants: {
    pinned: {
      true: {
        position: 'fixed',
        zIndex: 11,
      },
    },
  },
});

// 去除宽度拖拽手柄

const searchContainer = css({
  display: 'flex',
  gap: '$2',
  alignItems: 'center',
});

const actionButton = css({
  padding: '$2',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$2',
  cursor: 'pointer',
  border: 'none',
  color: '#FFFFFF',
  fontSize: '14px',
  transition: 'all 0.2s',
  '&:hover': {
    filter: 'brightness(0.95)',
  },
  
  variants: {
    type: {
      sort: {
        backgroundColor: 'hsl(152, 33%, 60%)',
      },
      drag: {
        backgroundColor: 'hsl(200, 50%, 60%)',
      },
      pin: {
        backgroundColor: 'hsl(45, 70%, 60%)',
      },
      menu: {
        backgroundColor: 'transparent',
      },
    },
    active: {
      true: {
        backgroundColor: 'hsl(220, 70%, 50%)',
        transform: 'scale(0.95)',
      },
    },
  },
});

const iconBtn = css({
  width: '24px',
  height: '24px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  padding: '0',
  cursor: 'pointer',
});

type Props = {
  themeMode: AppUserConfigs['preferredThemeMode'];
  placement?: 'overlay' | 'sidebar';
};

const appSidebar = css({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  backgroundColor: '$elevation0',
  padding: '$3',
  width: '100%',
  height: '100%',
  overflow: 'auto',
});

export function App({ themeMode: initialThemeMode, placement = 'overlay' }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const isVisible = useAppVisible();
  const [filter, setFilter] = useState('');
  const [expandNext, setExpandNext] = useState(true);
  const [apply, setApply] = useState<{ version: number; expand: boolean }>({ version: 0, expand: true });
  // 拖拽排序默认开启，无需开关
  const themeMode = useThemeMode(initialThemeMode);
  const { settings, updateSetting } = usePluginSettings();

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const toggleSort = () => {
    updateSetting('sortAscending', !settings.sortAscending);
  };

  // 无拖拽开关

  const togglePin = () => {
    updateSetting('isPinned', !settings.isPinned);
  };

  // 移除宽度拖拽

  // 移除宽度持久化

  // 覆盖层版本：不再切换 pointer-events，统一保持可交互

  if (placement === 'sidebar') {
    return (
      <div className={`${themeMode === 'dark' ? darkTheme.className : ''} ${appSidebar()}`}>
        {/* 左侧栏版本：列表（此处不启用拖拽） */}
        <TagList 
          filter={filter} 
          sortAscending={settings.sortAscending}
          enableDragSort={false}
        />
      </div>
    );
  }

  if (isVisible) {
    return (
      <main
        className={`${body()} ${themeMode === 'dark' ? darkTheme.className : ''}`}
        onClick={e => {
          try {
            if (!innerRef.current?.contains(e.target as any)) {
              window.logseq?.hideMainUI?.();
            }
          } catch (error) {
            console.error('Error handling click:', error);
          }
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          ref={innerRef}
          className={app({ pinned: settings.isPinned })}
          // 当固定时，只允许面板本身交互，其余区域可点击
          style={{ pointerEvents: 'auto' }}
        >
          {/* 搜索 + 菜单按钮 */}
          <div className={searchContainer()}>
            <Input
              css={{ flex: 1, padding: '$3', borderRadius: '$2' }}
              size='2'
              placeholder='Search tags'
              onChange={handleSearchInputChange}
            />
            <button
              className={iconBtn()}
              title={expandNext ? 'Expand all' : 'Collapse all'}
              onClick={() => {
                try {
                  const saved = localStorage.getItem('logseq-plugin-tags-expanded');
                  const map = saved ? JSON.parse(saved) : {};
                  const values = Object.values(map) as boolean[];
                  const allExpanded = values.length > 0 && values.every(v => v === true);
                  const next = !allExpanded;
                  // 设置将要应用的动作
                  setApply(prev => ({ version: prev.version + 1, expand: next }));
                  // 下一次点击取反
                  setExpandNext(!next);
                } catch {
                  setApply(prev => ({ version: prev.version + 1, expand: true }));
                  setExpandNext(false);
                }
              }}
            >
              <img src={foldIcon} alt='toggle expand' style={{ width: 18, height: 18, transform: expandNext ? 'rotate(180deg)' : 'none', opacity: 0.85 }} />
            </button>
          </div>
          <TagList 
            filter={filter} 
            sortAscending={settings.sortAscending}
            enableDragSort={true}
            refresh={apply.version}
            applyExpand={apply}
          />
        </div>
      </main>
    );
  }

  return null;
}

export default App;
