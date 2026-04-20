import { NextResponse } from 'next/server'
import { streamDeepSeekChat, type ChatCompletionMessage } from '@/lib/llm/deepseek'
import { getSystemPrompt } from '@/services/prompt-templates'
import type { ChatMode } from '@/types/chat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ClientMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequestBody {
  mode?: ChatMode
  messages: ClientMessage[]
}

const HISTORY_LIMIT = 20

export async function POST(request: Request) {
  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const mode: ChatMode = body.mode === 'technical' ? 'technical' : 'theory'
  const incoming = Array.isArray(body.messages) ? body.messages : []
  if (incoming.length === 0) {
    return NextResponse.json({ error: 'messages 不能为空' }, { status: 400 })
  }

  const trimmed = incoming.slice(-HISTORY_LIMIT).filter((m) => m && typeof m.content === 'string')

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: getSystemPrompt(mode) },
    ...trimmed.map<ChatCompletionMessage>((m) => ({
      role: m.role,
      content: m.content,
    })),
  ]

  let upstream: Response
  try {
    upstream = await streamDeepSeekChat({ messages })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // 解析上游 OpenAI SSE，只把 delta.content 文本块往下游推
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = upstream.body!.getReader()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // SSE 以 \n\n 分帧
          let idx: number
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)

            for (const line of frame.split('\n')) {
              const trimmedLine = line.trim()
              if (!trimmedLine.startsWith('data:')) continue
              const data = trimmedLine.slice(5).trim()
              if (!data || data === '[DONE]') continue

              try {
                const json = JSON.parse(data) as {
                  choices?: { delta?: { content?: string } }[]
                }
                const delta = json.choices?.[0]?.delta?.content
                if (delta) controller.enqueue(encoder.encode(delta))
              } catch {
                // 忽略非 JSON 行（keepalive 注释等）
              }
            }
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
    cancel() {
      reader.cancel().catch(() => {})
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
