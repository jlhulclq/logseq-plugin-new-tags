import { useCallback, useEffect, useState } from 'react';

const TAG_ORDER_KEY = 'logseq-plugin-tags-order';

export function useTagOrder() {
  const [tagOrder, setTagOrder] = useState<string[]>([]);

  // 从localStorage加载排序
  useEffect(() => {
    const savedOrder = localStorage.getItem(TAG_ORDER_KEY);
    if (savedOrder) {
      try {
        setTagOrder(JSON.parse(savedOrder));
      } catch (error) {
        console.error('Failed to parse tag order from localStorage:', error);
      }
    }
  }, []);

  // 保存排序到localStorage
  const saveTagOrder = useCallback((newOrder: string[]) => {
    setTagOrder(newOrder);
    localStorage.setItem(TAG_ORDER_KEY, JSON.stringify(newOrder));
  }, []);

  // 更新标签排序
  const updateTagOrder = useCallback((activeId: string, overId: string) => {
    setTagOrder((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newOrder = [...prev];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);
      
      localStorage.setItem(TAG_ORDER_KEY, JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  // 添加新标签到排序列表
  const addTagToOrder = useCallback((tagName: string) => {
    setTagOrder((prev) => {
      if (prev.includes(tagName)) return prev;
      const newOrder = [...prev, tagName];
      localStorage.setItem(TAG_ORDER_KEY, JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  // 从排序列表中移除标签
  const removeTagFromOrder = useCallback((tagName: string) => {
    setTagOrder((prev) => {
      const newOrder = prev.filter(tag => tag !== tagName);
      localStorage.setItem(TAG_ORDER_KEY, JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  return {
    tagOrder,
    saveTagOrder,
    updateTagOrder,
    addTagToOrder,
    removeTagFromOrder,
  };
}
