import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*')

    const { data: conversations, error: convsErr } = await supabase
      .from('conversations')
      .select('*')

    const { data: papers, error: papersErr } = await supabase.from('paper_catalog').select('id')

    const { data: summaries, error: summariesErr } = await supabase
      .from('paper_summary')
      .select('paper_id')

    const { data: favorites, error: favErr } = await supabase.from('favorites').select('*')

    return NextResponse.json({
      status: 'ok',
      message: '数据库连接成功！',
      tables: {
        profiles: {
          connected: !profilesErr,
          count: profiles?.length ?? 0,
          error: profilesErr?.message,
        },
        conversations: {
          connected: !convsErr,
          count: conversations?.length ?? 0,
          error: convsErr?.message,
        },
        paper_catalog: {
          connected: !papersErr,
          count: papers?.length ?? 0,
          error: papersErr?.message,
        },
        paper_summary: {
          connected: !summariesErr,
          count: summaries?.length ?? 0,
          error: summariesErr?.message,
        },
        favorites: { connected: !favErr, count: favorites?.length ?? 0, error: favErr?.message },
      },
    })
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 })
  }
}
