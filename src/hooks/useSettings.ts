import { useEffect, useState } from 'react';
import { PluginSettings } from '../components/Settings';

const DEFAULT_SETTINGS: PluginSettings = {
  theme: 'colorful',
  shortcut: 'mod+shift+t',
};

const SETTINGS_KEY = 'logseq-plugin-tags-settings';

export function useSettings() {
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load plugin settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: PluginSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Update keyboard shortcut if changed
      if (newSettings.shortcut !== settings.shortcut) {
        updateKeyboardShortcut(newSettings.shortcut);
      }
    } catch (error) {
      console.error('Failed to save plugin settings:', error);
      throw error;
    }
  };

  const updateKeyboardShortcut = (shortcut: string) => {
    // This will be handled in main.tsx
    if (window.logseq && window.logseq.updateSettings) {
      window.logseq.updateSettings({ shortcut });
    }
  };

  const resetSettings = async () => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      setSettings(DEFAULT_SETTINGS);
      updateKeyboardShortcut(DEFAULT_SETTINGS.shortcut);
    } catch (error) {
      console.error('Failed to reset plugin settings:', error);
      throw error;
    }
  };

  return {
    settings,
    saveSettings,
    resetSettings,
    isLoading,
  };
}