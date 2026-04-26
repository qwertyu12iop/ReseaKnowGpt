import { NextResponse } from 'next/server'

export interface CozeWorkflowOptions {
  workflowId: string
  apiKey: string
  parameters: Record<string, string>
  tag: string
}

/**
 * 调用 Coze 非流式工作流接口，返回纯文本结果。
 * 使用 /v1/workflow/run（非流式），避免 Vercel Serverless 环境下
 * SSE 长连接超时及网络兼容性问题。
 */
export async function runCozeWorkflow({
  workflowId,
  apiKey,
  parameters,
  tag,
}: CozeWorkflowOptions): Promise<{ output: string | null; error?: string; status: number }> {
  try {
    const cozeRes = await fetch(
      'https://api.coze.cn/v1/workflow/run',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          parameters,
        }),
      },
    )

    if (!cozeRes.ok) {
      const text = await cozeRes.text().catch(() => '')
      console.error(`[${tag}] Coze API Error ${cozeRes.status}:`, text)
      return { output: null, error: 'service_unavailable', status: 502 }
    }

    const json = await cozeRes.json()

    if (json.code !== undefined && json.code !== 0) {
      console.error(`[${tag}] Coze workflow error:`, json.msg ?? json)
      return { output: null, error: 'service_unavailable', status: 502 }
    }

    let output = ''
    const rawData = json.data ?? json.output ?? json.answer ?? ''

    if (typeof rawData === 'string') {
      if (rawData.trim().startsWith('{')) {
        try {
          const nested = JSON.parse(rawData)
          output =
            (typeof nested.output === 'string' ? nested.output : undefined) ??
            (typeof nested.content === 'string' ? nested.content : undefined) ??
            (typeof nested.answer === 'string' ? nested.answer : undefined) ??
            rawData
        } catch {
          output = rawData
        }
      } else {
        output = rawData
      }
    } else if (rawData != null) {
      output = String(rawData)
    }

    return { output, status: 200 }
  } catch (err) {
    console.error(`[${tag}] Unexpected error:`, err)
    return { output: null, error: 'service_unavailable', status: 500 }
  }
}

export function missingCredentials() {
  console.error('[Workshop] Missing Coze credentials')
  return NextResponse.json({ error: 'service_unavailable' }, { status: 500 })
}
