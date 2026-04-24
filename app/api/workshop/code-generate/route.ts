import { NextResponse } from 'next/server'

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
    return NextResponse.json(
      { error: '未配置 Coze 工作流凭证（COZE_API_KEY / COZE_CODE_WORKFLOW_ID）' },
      { status: 500 },
    )
  }

  try {
    const cozeRes = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: { lang, req },
      }),
    })

    if (!cozeRes.ok) {
      const text = await cozeRes.text().catch(() => '')
      console.error(`[CodeGenerate] Coze API Error ${cozeRes.status}:`, text)

      let errorMsg = `Coze API 错误 ${cozeRes.status}`
      if (cozeRes.status === 401) {
        errorMsg = 'Coze API 认证失败，请检查 API Key 配置'
      } else if (cozeRes.status === 404) {
        errorMsg = '找不到指定的工作流，请检查 Workflow ID 配置'
      } else if (text) {
        try {
          const parsed = JSON.parse(text)
          errorMsg = parsed.msg || errorMsg
        } catch {
          errorMsg = text.slice(0, 100) || errorMsg
        }
      }

      return NextResponse.json({ error: errorMsg }, { status: 502 })
    }

    const result = (await cozeRes.json()) as {
      code?: number
      msg?: string
      data?: string
    }

    if (result.code !== 0) {
      console.error('[CodeGenerate] Workflow Execution Failed:', result)
      return NextResponse.json(
        { error: result.msg || 'Coze 工作流执行失败' },
        { status: 502 },
      )
    }

    let output = ''
    try {
      const parsed = JSON.parse(result.data ?? '{}') as { output?: string }
      output = parsed.output ?? result.data ?? ''
    } catch {
      output = result.data ?? ''
    }

    return NextResponse.json({ output })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
