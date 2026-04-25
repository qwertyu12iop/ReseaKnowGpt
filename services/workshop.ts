export interface StreamWorkshopPayload {
  path: string
  body: any
  onDelta: (chunk: string) => void
  signal?: AbortSignal
}

/** 单次网络包很大时仍让界面逐帧更新（Coze 常在一个 Message 里返回全文） */
const PROGRESSIVE_MIN_LEN = 320
const PROGRESSIVE_MAX_STEPS = 72

async function emitChunkForStreamUI(
  chunk: string,
  onDelta: (chunk: string) => void,
): Promise<void> {
  if (chunk.length < PROGRESSIVE_MIN_LEN) {
    onDelta(chunk)
    return
  }
  const step = Math.max(
    32,
    Math.ceil(chunk.length / PROGRESSIVE_MAX_STEPS),
  )
  for (let i = 0; i < chunk.length; i += step) {
    onDelta(chunk.slice(i, i + step))
    if (i + step < chunk.length) {
      await new Promise<void>((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => resolve())
        } else {
          queueMicrotask(resolve)
        }
      })
    }
  }
}

/**
 * 通用的工作流流式请求处理
 */
export async function streamWorkshop({
  path,
  body,
  onDelta,
  signal,
}: StreamWorkshopPayload): Promise<string> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new Error('service_unavailable')
  }

  if (!response.body) {
    throw new Error('service_unavailable')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      if (!chunk) continue
      full += chunk
      await emitChunkForStreamUI(chunk, onDelta)
    }
  } finally {
    reader.releaseLock()
  }

  const tail = decoder.decode()
  if (tail) {
    full += tail
    await emitChunkForStreamUI(tail, onDelta)
  }

  return full
}
