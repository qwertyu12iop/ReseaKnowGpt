import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type {
  FavoriteDetail,
  FavoriteEntry,
  FavoriteItemType,
  FavoriteListResponse,
  FavoriteRecord,
} from '@/types/favorite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_ITEM_TYPES: FavoriteItemType[] = ['paper_catalog', 'conversation', 'workshop_tool']

function isItemType(value: string): value is FavoriteItemType {
  return (VALID_ITEM_TYPES as string[]).includes(value)
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const typeParam = searchParams.get('itemType')

  let query = supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (typeParam && isItemType(typeParam)) {
    query = query.eq('item_type', typeParam)
  }

  const { data: favRows, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = favRows ?? []
  // 兼容旧库：literature 等已弃用的 item_type 不返回给客户端
  const validRows = rows.filter((row) => isItemType(row.item_type))

  // 按 item_type 分桶，批量拉取详情
  const paperIds = new Set<number>()
  const conversationIds = new Set<string>()

  for (const row of validRows) {
    if (row.item_type === 'paper_catalog') paperIds.add(Number(row.item_id))
    else if (row.item_type === 'conversation') conversationIds.add(row.item_id)
  }

  const [papersRes, conversationsRes] = await Promise.all([
    paperIds.size > 0
      ? supabase.from('paper_catalog').select('*').in('id', Array.from(paperIds))
      : Promise.resolve({ data: [] as unknown[], error: null }),
    conversationIds.size > 0
      ? supabase.from('conversations').select('*').in('id', Array.from(conversationIds))
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ])

  const paperMap = new Map<number, FavoriteDetail>()
  for (const p of (papersRes.data ?? []) as Array<Record<string, unknown>>) {
    paperMap.set(Number(p.id), {
      kind: 'paper_catalog',
      title: String(p.title ?? ''),
      authors: Array.isArray(p.authors) ? (p.authors as string[]) : [],
      abstract: (p.abstract as string | null) ?? null,
      year: (p.year as number | null) ?? null,
      venue: (p.venue as string | null) ?? null,
      url: String(p.url ?? ''),
      pdfUrl: (p.pdf_url as string | null) ?? null,
      source: p.source as FavoritePaperSource,
      category: p.category as FavoritePaperCategory,
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
      citedByCount: (p.cited_by_count as number | null) ?? 0,
      isOpenAccess: Boolean(p.is_open_access),
    })
  }

  const convMap = new Map<string, FavoriteDetail>()
  for (const c of (conversationsRes.data ?? []) as Array<Record<string, unknown>>) {
    convMap.set(String(c.id), {
      kind: 'conversation',
      title: String(c.title ?? ''),
      mode: (c.mode as 'theory' | 'technical') ?? 'theory',
      updatedAt: String(c.updated_at ?? c.created_at ?? ''),
    })
  }

  const items: FavoriteEntry[] = validRows.map((row) => {
    let detail: FavoriteDetail | null = null
    if (row.item_type === 'paper_catalog') {
      detail = paperMap.get(Number(row.item_id)) ?? null
    } else if (row.item_type === 'conversation') {
      detail = convMap.get(row.item_id) ?? null
    } else if (row.item_type === 'workshop_tool') {
      detail = { kind: 'workshop_tool', title: row.item_id }
    }

    const record: FavoriteRecord = {
      id: row.id,
      itemType: row.item_type as FavoriteItemType,
      itemId: row.item_id,
      note: row.note,
      createdAt: row.created_at,
    }
    return { ...record, detail }
  })

  const response: FavoriteListResponse = { items, total: items.length }
  return NextResponse.json(response)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as {
    itemType?: string
    itemId?: string | number
    note?: string | null
  } | null

  if (!body || !body.itemType || body.itemId === undefined || body.itemId === null) {
    return NextResponse.json({ error: 'missing itemType or itemId' }, { status: 400 })
  }
  if (!isItemType(body.itemType)) {
    return NextResponse.json({ error: 'invalid itemType' }, { status: 400 })
  }

  const itemId = String(body.itemId)

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      item_type: body.itemType,
      item_id: itemId,
      note: body.note ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'already favorited' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const record: FavoriteRecord = {
    id: data.id,
    itemType: data.item_type as FavoriteItemType,
    itemId: data.item_id,
    note: data.note,
    createdAt: data.created_at,
  }
  return NextResponse.json({ favorite: record })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get('id')
  const typeParam = searchParams.get('itemType')
  const itemIdParam = searchParams.get('itemId')

  let delete_ = supabase.from('favorites').delete().eq('user_id', user.id)

  if (idParam) {
    delete_ = delete_.eq('id', Number(idParam))
  } else if (typeParam && isItemType(typeParam) && itemIdParam) {
    delete_ = delete_.eq('item_type', typeParam).eq('item_id', itemIdParam)
  } else {
    return NextResponse.json({ error: 'missing id or (itemType & itemId)' }, { status: 400 })
  }

  const { error } = await delete_
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

type FavoritePaperSource = 'openalex' | 'arxiv' | 'semantic_scholar'
type FavoritePaperCategory =
  | 'ai'
  | 'systems'
  | 'algorithms'
  | 'network'
  | 'security'
  | 'theory'
  | 'database'
  | 'hci'
