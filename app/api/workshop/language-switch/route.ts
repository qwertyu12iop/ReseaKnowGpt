import { NextResponse } from 'next/server'
import { runCozeWorkflow, missingCredentials } from '@/lib/coze-stream'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface LanguageSwitchBody {
  lang: string
  code: string
}

export async function POST(request: Request) {
  let body: LanguageSwitchBody
  try {
    body = (await request.json()) as LanguageSwitchBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { lang, code } = body
  if (!lang || !code) {
    return NextResponse.json({ error: 'lang 和 code 不能为空' }, { status: 400 })
  }

  const apiKey = process.env.COZE_API_KEY
  const workflowId = process.env.COZE_LANG_SWITCH_WORKFLOW_ID

  if (!apiKey || !workflowId) {
    return missingCredentials()
  }

  const result = await runCozeWorkflow({
    workflowId,
    apiKey,
    parameters: { lang, code },
    tag: 'LanguageSwitch',
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ output: result.output })
}
