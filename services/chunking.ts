import 'server-only'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

export interface TextChunk {
  content: string
  metadata: {
    chunkIndex: number
    sourceUrl?: string
    sourceTitle?: string
    [key: string]: unknown
  }
}

const DEFAULT_CHUNK_SIZE = 800
const DEFAULT_CHUNK_OVERLAP = 150

/**
 * 使用 LangChain RecursiveCharacterTextSplitter 对文本进行分块
 * 支持中英文混合文档，保留适当重叠以确保上下文连贯
 */
export async function splitText(
  text: string,
  options?: {
    chunkSize?: number
    chunkOverlap?: number
    sourceUrl?: string
    sourceTitle?: string
  },
): Promise<TextChunk[]> {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
    sourceUrl,
    sourceTitle,
  } = options ?? {}

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', '；', ';', ' ', ''],
  })

  const docs = await splitter.createDocuments([text])

  return docs.map((doc, idx) => ({
    content: doc.pageContent.trim(),
    metadata: {
      chunkIndex: idx,
      sourceUrl,
      sourceTitle,
      charCount: doc.pageContent.length,
    },
  }))
}
