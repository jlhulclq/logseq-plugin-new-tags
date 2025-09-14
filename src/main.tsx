import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

async function main() {
  const key = logseq.baseInfo.id;
  console.info(`${key}: MAIN`);

  const { preferredThemeMode } = await logseq.App.getUserConfigs();

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
  // 注册命令到命令面板；配合 package.json 的 keybindings，
  // 会出现在 Settings → Shortcuts 中，可自定义（默认不设置按键）
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
