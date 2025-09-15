import React, { createContext, useContext, ReactNode } from 'react';
import { PluginSettings } from '../components/Settings';

interface ThemeContextType {
  settings: PluginSettings;
  isSimpleTheme: boolean;
  isColorfulTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  settings: PluginSettings;
  children: ReactNode;
}

export function ThemeProvider({ settings, children }: ThemeProviderProps) {
  const value: ThemeContextType = {
    settings,
    isSimpleTheme: settings.theme === 'simple',
    isColorfulTheme: settings.theme === 'colorful',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}