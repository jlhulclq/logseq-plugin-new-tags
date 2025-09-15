import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Listen for settings changes
logseq.onSettingsChanged((newSettings: any, oldSettings: any) => {
  if (newSettings.shortcut !== oldSettings?.shortcut) {
    registerKeyboardShortcut(newSettings.shortcut);
  }
});

let currentShortcut = '';
let isCustomShortcutRegistered = false;

function registerKeyboardShortcut(shortcut: string) {
  if (!shortcut) return;
  
  try {
    // Remove previous shortcut if exists
    if (isCustomShortcutRegistered) {
      logseq.App.unregisterCommandPalette?.({
        key: 'open-tags-panel-custom',
      });
      isCustomShortcutRegistered = false;
    }
    
    // Only register if shortcut is different from default
    if (shortcut !== 'mod+shift+t') {
      // Register new shortcut
      logseq.App.registerCommandPalette?.(
        {
          key: 'open-tags-panel-custom',
          label: `Open Tags Panel (${shortcut})`,
          keybinding: {
            binding: shortcut,
          },
        },
        () => logseq.showMainUI()
      );
      isCustomShortcutRegistered = true;
    }
    
    currentShortcut = shortcut;
  } catch (error) {
    console.warn('Failed to register keyboard shortcut:', error);
  }
}

async function main() {
  const key = logseq.baseInfo.id;
  console.info(`${key}: MAIN`);

  const { preferredThemeMode } = await logseq.App.getUserConfigs();
  
  // Define plugin settings schema
  logseq.useSettingsSchema([
    {
      key: "theme",
      type: "enum",
      enumChoices: ["colorful", "simple"],
      title: "Theme Style / 主题样式",
      description: "Choose between colorful theme with vibrant colors or simple theme with minimal styling. / 选择彩色主题（多彩背景）或简单主题（极简风格）。",
      default: "colorful"
    },
    {
      key: "shortcut",
      type: "string",
      title: "Keyboard Shortcut / 快捷键",
      description: "Set a keyboard shortcut to quickly open the tags panel (e.g., mod+shift+t). / 设置快捷键以快速打开标签面板（例如：mod+shift+t）。",
      default: "mod+shift+t"
    }
  ]);
  
  // Apply keyboard shortcut from settings
  const settings = logseq.settings;
  if (settings?.shortcut) {
    registerKeyboardShortcut(settings.shortcut);
  }

  // 覆盖层版本：点击工具栏按钮显示
  ReactDOM.render(
    <React.StrictMode>
      <App themeMode={preferredThemeMode} placement='overlay' />
    </React.StrictMode>,
    document.getElementById('root'),
  );

  // 提供模型与命令（用于快捷键绑定）
  logseq.provideModel({
    show() {
      logseq.showMainUI();
    },
    openTagsPanel() {
      logseq.showMainUI();
    },
  });
  // 注册默认命令到命令面板
  try {
    (logseq as any).App.registerCommandPalette?.(
      { key: 'open-tags-panel', label: 'Open Tags Panel' },
      () => logseq.showMainUI(),
    );
  } catch {}

  // 强制开启交互，避免历史版本残留 pointer-events:none
  logseq.setMainUIInlineStyle({ position: 'fixed', zIndex: 11, pointerEvents: 'auto' });

  const toolbarButtonKey = 'tags-plugin-open';

  logseq.provideStyle(`
    div[data-injected-ui=${toolbarButtonKey}-${key}] {
      display: flex;
      align-items: center;
      font-weight: 500;
      position: relative;
    }
  `);

  logseq.App.registerUIItem('toolbar', {
    key: toolbarButtonKey,
    template: `
    <a data-on-click="show" class="button" style="font-size: 20px">
      #
    </a>
  `,
  });
}

logseq.ready().then(main).catch(console.error);
