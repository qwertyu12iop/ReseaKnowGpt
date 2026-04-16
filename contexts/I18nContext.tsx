'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '@/locales'
import type { Locale, TranslationKey } from '@/locales'

export type { Locale, TranslationKey }
export { translations }

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  const saved = localStorage.getItem('locale') as Locale | null
  return saved === 'zh' || saved === 'en' ? saved : 'zh'
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => translations[locale][key] as string,
    [locale],
  )

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
