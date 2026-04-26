export interface WorkshopPayload {
  path: string
  body: any
  onDelta: (chunk: string) => void
  signal?: AbortSignal
}

const TYPEWRITER_STEP = 48
const TYPEWRITER_INTERVAL_MS = 16

/**
 * 将一段完整文本以打字机效果逐步输出给 onDelta 回调，
 * 保持与旧版流式输出一致的 UI 体验。
 */
async function typewriterEmit(
  text: string,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  for (let i = 0; i < text.length; i += TYPEWRITER_STEP) {
    if (signal?.aborted) return
    onDelta(text.slice(i, i + TYPEWRITER_STEP))
    if (i + TYPEWRITER_STEP < text.length) {
      await new Promise<void>((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() =>
            setTimeout(resolve, TYPEWRITER_INTERVAL_MS),
          )
        } else {
          setTimeout(resolve, TYPEWRITER_INTERVAL_MS)
        }
      })
    }
  }
}

/**
 * 调用 Workshop API 并以伪打字机方式展示结果。
 * 后端已改为非流式接口（返回 JSON { output }），前端用逐字输出模拟流式体验。
 */
export async function streamWorkshop({
  path,
  body,
  onDelta,
  signal,
}: WorkshopPayload): Promise<string> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new Error('service_unavailable')
  }

  const json = await response.json()
  const output: string = json.output ?? ''

  if (!output) {
    throw new Error('service_unavailable')
  }

  await typewriterEmit(output, onDelta, signal)

  return output
}
