import 'server-only'

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekStreamOptions {
  messages: ChatCompletionMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

function getConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.DEEPSEEK_API_BASE_URL ?? 'https://api.deepseek.com'
  const defaultModel = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'

  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY in environment variables')
  }

  return { apiKey: apiKey.trim(), baseUrl: baseUrl.trim().replace(/\/$/, ''), defaultModel }
}

/**
 * 调用 DeepSeek Chat Completions（OpenAI 兼容）开启流式
 * 返回上游 Response，调用方负责消费 body
 */
export async function streamDeepSeekChat({
  messages,
  model,
  temperature = 0.7,
  maxTokens,
  signal,
}: DeepSeekStreamOptions): Promise<Response> {
  const { apiKey, baseUrl, defaultModel } = getConfig()

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model ?? defaultModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal,
  })

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '')
    throw new Error(`DeepSeek API error ${response.status}: ${text || response.statusText}`)
  }

  return response
}

export interface DeepSeekChatOptions {
  messages: ChatCompletionMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  responseFormat?: 'text' | 'json_object'
  signal?: AbortSignal
}

/**
 * 非流式调用 DeepSeek，直接返回 assistant 文本
 */
export async function chatDeepSeek({
  messages,
  model,
  temperature = 0.3,
  maxTokens,
  responseFormat = 'text',
  signal,
}: DeepSeekChatOptions): Promise<string> {
  const { apiKey, baseUrl, defaultModel } = getConfig()

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model ?? defaultModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      response_format: { type: responseFormat },
    }),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`DeepSeek API error ${response.status}: ${text || response.statusText}`)
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return json.choices?.[0]?.message?.content ?? ''
}
