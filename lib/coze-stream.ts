import { NextResponse } from 'next/server'

export interface CozeWorkflowOptions {
  workflowId: string
  apiKey: string
  parameters: Record<string, string>
  tag: string
}

export function createCozeStream({
  workflowId,
  apiKey,
  parameters,
  tag,
}: CozeWorkflowOptions) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return {
    async run(): Promise<Response> {
      const cozeRes = await fetch(
        'https://api.coze.cn/v1/workflow/stream_run',
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
        return NextResponse.json(
          { error: 'service_unavailable' },
          { status: 502 },
        )
      }

      const reader = cozeRes.body!.getReader()

      const stream = new ReadableStream({
        async start(controller) {
          function parseAndEmitFrames(buf: string): string {
            let buffer = buf
            let idx: number
            while ((idx = buffer.indexOf('\n\n')) !== -1) {
              const frame = buffer.slice(0, idx)
              buffer = buffer.slice(idx + 2)

              let event = ''
              const dataLines: string[] = []

              for (const line of frame.split('\n')) {
                const trimmed = line.trim()
                if (trimmed.startsWith('event:')) {
                  event = trimmed.slice(6).trim()
                } else if (trimmed.startsWith('data:')) {
                  dataLines.push(trimmed.slice(5).trim())
                }
              }

              const data = dataLines.join('\n')

              if (event === 'Message' && data) {
                try {
                  const json = JSON.parse(data)
                  let content: string =
                    json.content ?? json.output ?? json.answer ?? ''

                  if (typeof content !== 'string') {
                    content = content != null ? String(content) : ''
                  }

                  if (content.trim().startsWith('{')) {
                    try {
                      const nested = JSON.parse(content)
                      content =
                        (typeof nested.output === 'string'
                          ? nested.output
                          : undefined) ??
                        (typeof nested.content === 'string'
                          ? nested.content
                          : undefined) ??
                        content
                    } catch {
                      // keep original
                    }
                  }

                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch (e) {
                  console.error(
                    `[${tag}] Failed to parse message data:`,
                    data,
                    e,
                  )
                }
              } else if (event === 'Error') {
                console.error(`[${tag}] Coze Stream Error:`, data)
              } else if (event === 'Interrupt') {
                console.warn(`[${tag}] Coze Stream Interrupted:`, data)
              }
            }
            return buffer
          }

          let buffer = ''
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (value?.length) {
                buffer +=
                  decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
                buffer = parseAndEmitFrames(buffer)
              }
              if (done) {
                buffer += decoder.decode()
                buffer = buffer.replace(/\r\n/g, '\n')
                buffer = parseAndEmitFrames(buffer)
                if (buffer.trim()) {
                  console.warn(
                    `[${tag}] Trailing SSE buffer (incomplete frame):`,
                    buffer.slice(0, 200),
                  )
                }
                break
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
    },
  }
}

export function missingCredentials() {
  console.error('[Workshop] Missing Coze credentials')
  return NextResponse.json({ error: 'service_unavailable' }, { status: 500 })
}
