'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Theme = 'dark' | 'light';
export type Accent = 'indigo' | 'blue' | 'purple' | 'emerald';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accent: Accent;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [accent, setAccentState] = useState<Accent>('indigo');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedAccent = localStorage.getItem('accent') as Accent | null;
    const t = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'dark';
    const a = savedAccent ?? 'indigo';
    setThemeState(t);
    setAccentState(a as Accent);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-accent', a);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem('accent', newAccent);
    document.documentElement.setAttribute('data-accent', newAccent);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
