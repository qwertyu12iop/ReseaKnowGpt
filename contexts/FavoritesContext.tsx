'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { addFavorite, favoriteKey, fetchFavorites, removeFavorite } from '@/services/favorites'
import type { FavoriteEntry, FavoriteItemType } from '@/types/favorite'

interface FavoritesContextValue {
  entries: FavoriteEntry[]
  keys: Set<string>
  loading: boolean
  error: string | null
  isFavorited: (itemType: FavoriteItemType, itemId: string | number) => boolean
  toggle: (itemType: FavoriteItemType, itemId: string | number) => Promise<boolean>
  refresh: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, requireAuth } = useAuth()
  const [entries, setEntries] = useState<FavoriteEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setEntries([])
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFavorites({}, controller.signal)
      setEntries(res.items)
    } catch (err) {
      if (controller.signal.aborted) return
      setError(err instanceof Error ? err.message : '加载收藏失败')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  const keys = useMemo(() => {
    return new Set(entries.map((e) => favoriteKey(e.itemType, e.itemId)))
  }, [entries])

  const isFavorited = useCallback(
    (itemType: FavoriteItemType, itemId: string | number) =>
      keys.has(favoriteKey(itemType, itemId)),
    [keys],
  )

  const toggle = useCallback(
    async (itemType: FavoriteItemType, itemId: string | number): Promise<boolean> => {
      if (!requireAuth()) return false
      const key = favoriteKey(itemType, itemId)
      const existing = entries.find(
        (e) => favoriteKey(e.itemType, e.itemId) === key,
      )
      try {
        if (existing) {
          setEntries((prev) => prev.filter((e) => e.id !== existing.id))
          await removeFavorite({ id: existing.id })
          return false
        } else {
          const rec = await addFavorite({ itemType, itemId })
          setEntries((prev) => [
            { ...rec, detail: null },
            ...prev.filter((e) => favoriteKey(e.itemType, e.itemId) !== key),
          ])
          // 刷新以获取详情
          void load()
          return true
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '操作失败')
        void load()
        return existing != null
      }
    },
    [entries, load, requireAuth],
  )

  return (
    <FavoritesContext.Provider
      value={{ entries, keys, loading, error, isFavorited, toggle, refresh: load }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
