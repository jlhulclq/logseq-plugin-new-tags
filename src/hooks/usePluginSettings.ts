import { useCallback, useEffect, useState } from 'react';

interface PluginSettings {
  width: number;
  isPinned: boolean;
  sortAscending: boolean;
  dockedLeft: boolean;
}

const SETTINGS_KEY = 'logseq-plugin-tags-settings';

const DEFAULT_SETTINGS: PluginSettings = {
  width: 400,
  isPinned: false,
  sortAscending: false,
  dockedLeft: false,
};

export function usePluginSettings() {
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse plugin settings from localStorage:', error);
      }
    }
  }, []);

  // 保存设置到localStorage
  const saveSettings = useCallback((newSettings: Partial<PluginSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 更新单个设置
  const updateSetting = useCallback(<K extends keyof PluginSettings>(
    key: K,
    value: PluginSettings[K]
  ) => {
    saveSettings({ [key]: value });
  }, [saveSettings]);

  return {
    settings,
    saveSettings,
    updateSetting,
  };
}
