import 'server-only'

/**
 * ChinaXiv OAI-PMH 客户端
 * 官网：http://chinaxiv.org
 * 协议：OAI-PMH 2.0，返回 Dublin Core XML
 *
 * 主要学科集合（set）：
 *   cs       - 计算机科学
 *   math     - 数学
 *   physics  - 物理学
 *   econ     - 经济学
 *   q-bio    - 定量生物学
 */

const CHINAXIV_OAI = 'http://chinaxiv.org/oai'

export interface ChinaXivPaper {
  externalId: string // 'chinaxiv:202301.00001'
  title: string
  authors: string[]
  abstract: string
  year: number | null
  url: string
  pdfUrl: string | null
  publishedAt: string
}

export interface ChinaXivSearchOptions {
  set?: string
  from?: string // YYYY-MM-DD
  maxResults?: number
  signal?: AbortSignal
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)</${tag}>`, 'g')
  const result: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    result.push(m[1])
  }
  return result
}

function extractFirst(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)</${tag}>`)
  const m = re.exec(xml)
  return m ? m[1] : null
}

/** 从 OAI-PMH record 块解析单篇论文 */
function parseRecord(recordXml: string): ChinaXivPaper | null {
  const metaBlock = extractFirst(recordXml, 'metadata')
  if (!metaBlock) return null

  // Dublin Core 标签带命名空间前缀，兼容 dc: 和 oai_dc: 前缀
  const title = extractFirst(metaBlock, 'dc:title') ?? extractFirst(metaBlock, 'title')
  const description =
    extractFirst(metaBlock, 'dc:description') ?? extractFirst(metaBlock, 'description')
  const dateRaw = extractFirst(metaBlock, 'dc:date') ?? extractFirst(metaBlock, 'date')

  if (!title) return null

  // 作者可能有多个
  const creatorTags = extractAll(metaBlock, 'dc:creator')
  const authors = creatorTags.length
    ? creatorTags.map(decodeEntities)
    : extractAll(metaBlock, 'creator').map(decodeEntities)

  // 标识符列表中取 URL（http 开头的那个）
  const identifiers = [
    ...extractAll(metaBlock, 'dc:identifier'),
    ...extractAll(metaBlock, 'identifier'),
  ].map(decodeEntities)

  const pageUrl = identifiers.find((id) => id.startsWith('http')) ?? null
  if (!pageUrl) return null

  // OAI identifier 形如 oai:chinaxiv.org:202301.00001
  const headerBlock = extractFirst(recordXml, 'header')
  const oaiId = headerBlock ? extractFirst(headerBlock, 'identifier') : null
  const idMatch = oaiId ? /chinaxiv\.org[:/](.+)/.exec(oaiId) : null
  const localId = idMatch ? idMatch[1] : pageUrl.replace(/.*\//, '')

  const dateStr = dateRaw ? decodeEntities(dateRaw).trim() : ''
  const year = dateStr ? Number(dateStr.slice(0, 4)) || null : null

  // PDF URL：尝试将 abs 路径替换为 pdf 路径
  const pdfUrl = pageUrl.includes('/abs/')
    ? pageUrl.replace('/abs/', '/pdf/') + '.pdf'
    : null

  return {
    externalId: `chinaxiv:${localId}`,
    title: decodeEntities(title),
    authors,
    abstract: description ? decodeEntities(description) : '',
    year,
    url: pageUrl,
    pdfUrl,
    publishedAt: dateStr,
  }
}

/**
 * 从 ChinaXiv OAI-PMH 接口按学科集合拉取最近论文。
 * 注意：OAI-PMH ListRecords 是按时间范围批量拉取，非关键词检索，
 * 因此用 from 参数限制近期范围。
 */
export async function fetchChinaXiv({
  set = 'cs',
  from,
  maxResults = 20,
  signal,
}: ChinaXivSearchOptions): Promise<ChinaXivPaper[]> {
  // 默认拉取近 90 天
  if (!from) {
    const d = new Date()
    d.setDate(d.getDate() - 90)
    from = d.toISOString().slice(0, 10)
  }

  const params = new URLSearchParams({
    verb: 'ListRecords',
    metadataPrefix: 'oai_dc',
    set,
    from,
  })

  const url = `${CHINAXIV_OAI}?${params.toString()}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'ReseaKnowGPT/1.0' },
    signal,
    // OAI-PMH 响应可能较大，给足超时时间
    ...(typeof AbortSignal !== 'undefined' && !signal
      ? { signal: AbortSignal.timeout(15000) }
      : {}),
  })

  if (!res.ok) throw new Error(`ChinaXiv OAI-PMH error ${res.status}`)

  const xml = await res.text()

  // 检查是否有 OAI-PMH 错误
  const errorMatch = /<error[^>]*>([^<]+)<\/error>/.exec(xml)
  if (errorMatch) throw new Error(`ChinaXiv OAI-PMH: ${errorMatch[1]}`)

  const records = extractAll(xml, 'record')
  const papers: ChinaXivPaper[] = []

  for (const rec of records) {
    if (papers.length >= maxResults) break
    // 跳过已删除的记录
    if (/<header[^>]*status="deleted"/.test(rec)) continue
    const paper = parseRecord(rec)
    if (paper) papers.push(paper)
  }

  return papers
}
