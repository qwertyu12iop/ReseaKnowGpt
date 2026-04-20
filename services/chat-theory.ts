import type { ChatMode } from '@/types/chat'

export interface StreamChatPayload {
  mode: ChatMode
  messages: { role: 'user' | 'assistant'; content: string }[]
  signal?: AbortSignal
  onDelta: (chunk: string) => void
}

/**
 * 调用 /api/chat，逐 chunk 把文本回调给上层
 * 返回完整拼接后的回答
 */
export async function streamChat({
  mode,
  messages,
  signal,
  onDelta,
}: StreamChatPayload): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, messages }),
    signal,
  })

  if (!response.ok) {
    let detail = ''
    try {
      const data = (await response.json()) as { error?: string }
      detail = data.error ?? ''
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(detail || `请求失败：${response.status}`)
  }

  if (!response.body) {
    throw new Error('响应为空，无法读取流')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      if (chunk) {
        full += chunk
        onDelta(chunk)
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}
