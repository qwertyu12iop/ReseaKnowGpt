import type {
  FavoriteItemType,
  FavoriteListResponse,
  FavoriteRecord,
} from '@/types/favorite'

export async function fetchFavorites(
  params: { itemType?: FavoriteItemType } = {},
  signal?: AbortSignal,
): Promise<FavoriteListResponse> {
  const sp = new URLSearchParams()
  if (params.itemType) sp.set('itemType', params.itemType)
  const res = await fetch(`/api/favorites?${sp.toString()}`, {
    signal,
    credentials: 'include',
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `请求失败：${res.status}`)
  }
  return (await res.json()) as FavoriteListResponse
}

export async function addFavorite(params: {
  itemType: FavoriteItemType
  itemId: string | number
  note?: string | null
}): Promise<FavoriteRecord> {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `请求失败：${res.status}`)
  }
  const data = (await res.json()) as { favorite: FavoriteRecord }
  return data.favorite
}

export async function removeFavorite(params: {
  id?: number
  itemType?: FavoriteItemType
  itemId?: string | number
}): Promise<void> {
  const sp = new URLSearchParams()
  if (params.id != null) sp.set('id', String(params.id))
  if (params.itemType) sp.set('itemType', params.itemType)
  if (params.itemId != null) sp.set('itemId', String(params.itemId))
  const res = await fetch(`/api/favorites?${sp.toString()}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `请求失败：${res.status}`)
  }
}

export function favoriteKey(itemType: FavoriteItemType, itemId: string | number): string {
  return `${itemType}:${itemId}`
}
