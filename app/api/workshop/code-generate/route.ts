import { NextResponse } from 'next/server'
import { createCozeStream, missingCredentials } from '@/lib/coze-stream'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CodeGenerateBody {
  lang: string
  req: string
}

export async function POST(request: Request) {
  let body: CodeGenerateBody
  try {
    body = (await request.json()) as CodeGenerateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { lang, req } = body
  if (!lang || !req) {
    return NextResponse.json({ error: 'lang 和 req 不能为空' }, { status: 400 })
  }

  const apiKey = process.env.COZE_API_KEY
  const workflowId = process.env.COZE_CODE_WORKFLOW_ID

  if (!apiKey || !workflowId) {
    return missingCredentials()
  }

  try {
    return await createCozeStream({
      workflowId,
      apiKey,
      parameters: { lang, req },
      tag: 'CodeGenerate',
    }).run()
  } catch (err) {
    console.error('[CodeGenerate] Unexpected error:', err)
    return NextResponse.json({ error: 'service_unavailable' }, { status: 500 })
  }
}
