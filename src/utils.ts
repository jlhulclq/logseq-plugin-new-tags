import { QueryResultPageEntity } from 'logseqQueryResultTypes';

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
export function escapeRegExp(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function isPage(blockOrPage: any): blockOrPage is QueryResultPageEntity {
  return blockOrPage.hasOwnProperty('tags');
}

export function orderBy<T>(retriever: (v: T) => number, desc?: boolean): (a: T, b: T) => number {
  return desc
    ? (rhs, lhs) => retriever(lhs) - retriever(rhs)
    : (lhs, rhs) => retriever(lhs) - retriever(rhs);
}

// 根据字符串生成固定的色相值
export function generateHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash % 360;
}

// 获取标签的颜色主题
export function getTagColorTheme(tagName: string) {
  const hue = generateHue(tagName);
  const saturation = '34%';
  
  return {
    light: `hsl(${hue}, ${saturation}, 90%)`,    // 最浅色 - 用于展开按钮背景
    medium: `hsl(${hue}, ${saturation}, 80%)`,   // 浅色 - 用于边框
    regular: `hsl(${hue}, ${saturation}, 60%)`,  // 常规色 - 用于数字统计背景
    dark: `hsl(${hue}, ${saturation}, 40%)`,     // 深色 - 用于文字和图标
  };
};
