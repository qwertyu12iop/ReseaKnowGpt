import 'server-only'
import { chatDeepSeek } from '@/lib/llm/deepseek'

const SYSTEM_PROMPT = `你是学术检索助手。根据用户问题与 AI 回答，抽取最适合在英文学术数据库（OpenAlex / Semantic Scholar）中检索文献的英文关键词组。

要求：
1. 仅输出 JSON 对象，结构为 { "keywords": ["...", "...", "..."] }
2. keywords 长度 1~3，每条是 2~5 个英文单词的短语，覆盖问题的核心概念
3. 必须使用规范的英文学术术语；中文术语必须翻译成英文
4. 不要包含太宽泛的词（如 "computer science", "machine learning" 单独出现）
5. 如果问题与学术研究无关（如闲聊），返回 { "keywords": [] }`

export async function extractSearchKeywords(question: string, answer: string): Promise<string[]> {
  const truncatedAnswer = answer.length > 1500 ? answer.slice(0, 1500) + '…' : answer
  const userContent = `【用户问题】\n${question}\n\n【AI 回答（截断）】\n${truncatedAnswer}`

  let raw = ''
  try {
    raw = await chatDeepSeek({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0,
      maxTokens: 200,
      responseFormat: 'json_object',
    })
  } catch {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as { keywords?: unknown }
    if (!Array.isArray(parsed.keywords)) return []
    return parsed.keywords
      .filter((k): k is string => typeof k === 'string')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, 3)
  } catch {
    return []
  }
}
