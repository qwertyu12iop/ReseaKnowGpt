import 'server-only'
import { chatDeepSeek } from '@/lib/llm/deepseek'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PaperKeyPoint, PaperSummary } from '@/types/paper'
import type { Json } from '@/types/supabase'

const SUMMARY_MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'

const SYSTEM_PROMPT = `你是计算机领域的学术论文解读专家。给定一篇论文的标题与英文摘要，请输出中文精读。

严格遵循：
1. 仅输出 JSON，结构为：
   {
     "summary_zh": "中文综述，300~500 字，覆盖研究问题、方法、主要贡献、结论",
     "key_points": [
       { "title": "要点标题（10 字内）", "content": "要点说明（1~2 句话）" }
     ]
   }
2. key_points 3~5 条，覆盖：研究动机 / 核心方法 / 关键贡献 / 局限或展望
3. 不编造摘要中没有的实验数据
4. 专有名词（算法名、模型名）保留英文
5. 语言客观，不使用"本文非常"这类主观评价`

export interface GenerateSummaryInput {
  paperId: number
  title: string
  abstract: string | null
  authors: string[]
  year: number | null
  venue: string | null
}

interface RawSummary {
  summary_zh?: string
  key_points?: unknown
}

function normalizeKeyPoints(raw: unknown): PaperKeyPoint[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const obj = item as Record<string, unknown>
      const title = typeof obj.title === 'string' ? obj.title.trim() : ''
      const content = typeof obj.content === 'string' ? obj.content.trim() : ''
      if (!title || !content) return null
      return { title, content }
    })
    .filter((p): p is PaperKeyPoint => p !== null)
    .slice(0, 6)
}

/** 生成并缓存 AI 精读；若缓存已存在直接返回 */
export async function getOrGenerateSummary(input: GenerateSummaryInput): Promise<PaperSummary> {
  const supabase = createAdminClient()

  const { data: cached } = await supabase
    .from('paper_summary')
    .select('*')
    .eq('paper_id', input.paperId)
    .maybeSingle()

  if (cached?.summary_zh) {
    return {
      paperId: cached.paper_id,
      summaryZh: cached.summary_zh,
      summaryEn: cached.summary_en,
      keyPoints: normalizeKeyPoints(cached.key_points),
      model: cached.model,
      generatedAt: cached.generated_at,
    }
  }

  if (!input.abstract) {
    throw new Error('该论文缺少摘要，无法生成 AI 精读')
  }

  const userContent = [
    `【标题】${input.title}`,
    `【作者】${input.authors.slice(0, 5).join(', ')}`,
    input.venue ? `【发表】${input.venue}${input.year ? ` · ${input.year}` : ''}` : '',
    `【摘要】${input.abstract}`,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = await chatDeepSeek({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    maxTokens: 1200,
    responseFormat: 'json_object',
  })

  let parsed: RawSummary
  try {
    parsed = JSON.parse(raw) as RawSummary
  } catch {
    throw new Error('AI 精读解析失败')
  }

  const summaryZh = typeof parsed.summary_zh === 'string' ? parsed.summary_zh.trim() : ''
  if (!summaryZh) {
    throw new Error('AI 精读生成失败')
  }
  const keyPoints = normalizeKeyPoints(parsed.key_points)

  const { error } = await supabase.from('paper_summary').upsert(
    {
      paper_id: input.paperId,
      summary_zh: summaryZh,
      key_points: keyPoints as unknown as Json,
      model: SUMMARY_MODEL,
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'paper_id' },
  )

  if (error) {
    // 缓存失败不影响返回，只记录
    console.warn('[paper-summary] cache write failed:', error.message)
  }

  return {
    paperId: input.paperId,
    summaryZh,
    summaryEn: null,
    keyPoints,
    model: SUMMARY_MODEL,
    generatedAt: new Date().toISOString(),
  }
}
