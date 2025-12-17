"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Appearance = {
  logo_url?: string;
  favicon_url?: string;
  primaryColor?: string;
  themeMode?: 'light' | 'dark' | 'system';
};

type AppearanceState = {
  appearance: Appearance;
  setAppearance: (next: Appearance) => void;
};

const AppearanceContext = createContext<AppearanceState | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = useState<Appearance>(() => {
    try {
      const raw = localStorage.getItem('cms_appearance');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const applyFromStorage = (value: string | null) => {
      if (!value) return;
      try {
        setAppearanceState(JSON.parse(value));
      } catch {}
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cms_appearance') {
        applyFromStorage(e.newValue);
      }
    };

    const onAppearanceUpdated = () => {
      try {
        const raw = localStorage.getItem('cms_appearance');
        applyFromStorage(raw);
      } catch {}
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('appearanceUpdated', onAppearanceUpdated as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('appearanceUpdated', onAppearanceUpdated as EventListener);
    };
  }, []);

  const setAppearance = (next: Appearance) => {
    setAppearanceState(next);
    try {
      localStorage.setItem('cms_appearance', JSON.stringify(next));
    } catch {}
  };

  return (
    <AppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider');
  return ctx;
}
