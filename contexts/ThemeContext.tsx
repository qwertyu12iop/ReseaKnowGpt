'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type Theme = 'dark' | 'light'
export type Accent = 'indigo' | 'blue' | 'purple' | 'emerald'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem('theme') as Theme | null
  return saved === 'dark' || saved === 'light' ? saved : 'dark'
}

function getInitialAccent(): Accent {
  if (typeof window === 'undefined') return 'indigo'
  return (localStorage.getItem('accent') as Accent) ?? 'indigo'
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  accent: Accent
  setAccent: (accent: Accent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [accent, setAccentState] = useState<Accent>(getInitialAccent)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', accent)
  }, [theme, accent])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent)
    localStorage.setItem('accent', newAccent)
    document.documentElement.setAttribute('data-accent', newAccent)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
