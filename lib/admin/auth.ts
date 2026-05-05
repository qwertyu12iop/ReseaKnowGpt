import 'server-only'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fallback-secret',
)

export interface AdminPayload {
  adminId: number
  email: string
  role: 'admin' | 'super_admin'
}

export async function verifyAdminToken(request: Request): Promise<AdminPayload | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AdminPayload
  } catch {
    return null
  }
}

export function unauthorizedResponse() {
  return Response.json({ error: '未授权访问' }, { status: 401 })
}
