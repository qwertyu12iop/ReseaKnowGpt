import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. 测试连接：查询 profiles 表结构
    const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*')

    // 2. 测试连接：查询 conversations 表
    const { data: conversations, error: convsErr } = await supabase
      .from('conversations')
      .select('*')

    // 3. 测试连接：查询 literature 表
    const { data: literature, error: litErr } = await supabase.from('literature').select('*')

    // 4. 测试连接：查询 favorites 表
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
        literature: { connected: !litErr, count: literature?.length ?? 0, error: litErr?.message },
        favorites: { connected: !favErr, count: favorites?.length ?? 0, error: favErr?.message },
      },
    })
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 })
  }
}
