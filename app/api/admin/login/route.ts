import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SignJWT } from 'jose'

export const runtime = 'nodejs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fallback-secret',
)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin.rpc('verify_admin_login', {
      p_email: email,
      p_password: password,
    })

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const adminUser = Array.isArray(data) ? data[0] : data

    await admin
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminUser.id)

    const token = await new SignJWT({
      adminId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(JWT_SECRET)

    return NextResponse.json({
      token,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        nickname: adminUser.nickname,
        role: adminUser.role,
      },
    })
  } catch {
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
