'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPapers } from '@/services/papers'
import type { Paper, PaperCategory, PaperListQuery } from '@/types/paper'

export interface UsePapersState {
  items: Paper[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
}

const PAGE_SIZE = 20

export function usePapers(initial?: Partial<PaperListQuery>) {
  const [category, setCategory] = useState<PaperCategory | 'all'>(initial?.category ?? 'all')
  const [search, setSearch] = useState(initial?.search ?? '')
  const [sort, setSort] = useState<PaperListQuery['sort']>(initial?.sort ?? 'citations')
  const [page, setPage] = useState(initial?.page ?? 1)
  const [state, setState] = useState<UsePapersState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    loading: false,
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetchPapers(
        { category, search, sort, page, pageSize: PAGE_SIZE },
        controller.signal,
      )
      setState({
        items: res.items,
        total: res.total,
        page: res.page,
        pageSize: res.pageSize,
        loading: false,
        error: null,
      })
    } catch (err) {
      if (controller.signal.aborted) return
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : '加载失败',
      }))
    }
  }, [category, search, sort, page])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  // 搜索词/分类变化时自动回到第一页
  useEffect(() => {
    setPage(1)
  }, [category, search, sort])

  return {
    ...state,
    category,
    setCategory,
    search,
    setSearch,
    sort,
    setSort,
    page,
    setPage,
    refresh: load,
  }
}
