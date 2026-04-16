import zh from './zh'
import en from './en'

export const translations = { zh, en } as const

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof translations.zh
