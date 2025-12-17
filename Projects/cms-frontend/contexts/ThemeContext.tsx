'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';

interface ThemeSettings {
  themeMode: 'light' | 'dark' | 'system';
  primaryColor: string;
  logo_url?: string;
  logo_asset_id?: string;
  favicon_url?: string;
  favicon_asset_id?: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  loadTheme: () => Promise<void>;
  applyTheme: (settings: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>({
    themeMode: 'system',
    primaryColor: '#8b5cf6',
    logo_url: '',
  });

  const applyTheme = (settings: ThemeSettings) => {
    // Apply primary color to CSS variables
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
    }
    
    // Apply theme mode
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.themeMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const loadTheme = async () => {
    try {
      // Try to load from localStorage first
      const cached = localStorage.getItem('cms_theme');
      if (cached) {
        const parsed = JSON.parse(cached);
        setTheme(parsed);
        applyTheme(parsed);
      }

      // Then fetch from API (if authenticated via cookie)
      try {
        const res = await axios.get(buildApiUrl('/api/settings/appearance'), {
          withCredentials: true,
        });
        const appearance = (res.data as any)?.value || {};
        const newTheme: ThemeSettings = {
          themeMode: appearance.themeMode || 'system',
          primaryColor: appearance.primaryColor || '#8b5cf6',
          logo_url: appearance.logo_url || '',
          logo_asset_id: appearance.logo_asset_id,
          favicon_url: appearance.favicon_url || '',
          favicon_asset_id: appearance.favicon_asset_id,
        };
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('cms_theme', JSON.stringify(newTheme));
      } catch {}
    } catch (error) {
      // Use defaults if API fails
      applyTheme(theme);
    }
  };

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    applyTheme(updated);
    localStorage.setItem('cms_theme', JSON.stringify(updated));
  };

  useEffect(() => {
    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, loadTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
