import 'server-only'

function getConfig() {
  const apiKey = process.env.EMBEDDING_API_KEY
  const baseUrl =
    process.env.EMBEDDING_API_BASE_URL ?? 'https://api.siliconflow.cn/v1'
  const model = process.env.EMBEDDING_MODEL ?? 'BAAI/bge-large-zh-v1.5'

  if (!apiKey) {
    throw new Error('Missing EMBEDDING_API_KEY in environment variables')
  }

  return { apiKey: apiKey.trim(), baseUrl: baseUrl.trim().replace(/\/$/, ''), model }
}

/**
 * 调用 OpenAI 兼容的 Embedding API（默认 SiliconFlow + bge-large-zh-v1.5）
 * 返回 1024 维向量
 */
export async function generateEmbedding(text: string): Promise<{ embedding: number[] }> {
  const { apiKey, baseUrl, model } = getConfig()

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      encoding_format: 'float',
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Embedding API error ${response.status}: ${errText || response.statusText}`)
  }

  const json = (await response.json()) as {
    data?: { embedding?: number[] }[]
  }

  const embedding = json.data?.[0]?.embedding
  if (!embedding || embedding.length === 0) {
    throw new Error('Embedding API returned empty embedding')
  }

  return { embedding }
}

/**
 * 批量生成向量（SiliconFlow 支持批量输入）
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<{ embedding: number[] }[]> {
  if (texts.length === 0) return []

  const { apiKey, baseUrl, model } = getConfig()

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
      encoding_format: 'float',
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Embedding API error ${response.status}: ${errText || response.statusText}`)
  }

  const json = (await response.json()) as {
    data?: { embedding?: number[]; index?: number }[]
  }

  const sorted = (json.data ?? []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  return sorted.map((item) => ({ embedding: item.embedding ?? [] }))
}
