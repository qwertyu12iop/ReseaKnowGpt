import type { PaperCategory } from '@/types/paper'

/**
 * 每个分类对应的检索关键词组。
 * - OpenAlex：按关键词 search，按引用数排序，拉高被引论文
 * - arXiv：按分类标签（cat:cs.AI）+ 关键词，拉最新预印本
 */
export interface CategoryConfig {
  key: PaperCategory
  labelZh: string
  labelEn: string
  /** OpenAlex 检索关键词（英文） */
  openAlexQueries: string[]
  /** arXiv 检索表达式，使用 arXiv 官方语法 */
  arxivQueries: string[]
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    key: 'ai',
    labelZh: '人工智能',
    labelEn: 'AI / ML',
    openAlexQueries: [
      'large language model',
      'transformer architecture',
      'diffusion model',
      'reinforcement learning from human feedback',
      'retrieval augmented generation',
    ],
    arxivQueries: ['cat:cs.AI', 'cat:cs.LG', 'cat:cs.CL'],
  },
  {
    key: 'systems',
    labelZh: '系统',
    labelEn: 'Systems',
    openAlexQueries: [
      'distributed systems',
      'operating system kernel',
      'serverless computing',
      'container orchestration',
    ],
    arxivQueries: ['cat:cs.OS', 'cat:cs.DC'],
  },
  {
    key: 'algorithms',
    labelZh: '算法',
    labelEn: 'Algorithms',
    openAlexQueries: [
      'approximation algorithm',
      'graph algorithm',
      'randomized algorithm',
      'streaming algorithm',
    ],
    arxivQueries: ['cat:cs.DS'],
  },
  {
    key: 'network',
    labelZh: '网络',
    labelEn: 'Network',
    openAlexQueries: [
      'software defined networking',
      'congestion control',
      'QUIC protocol',
      '5G network slicing',
    ],
    arxivQueries: ['cat:cs.NI'],
  },
  {
    key: 'security',
    labelZh: '安全',
    labelEn: 'Security',
    openAlexQueries: [
      'zero knowledge proof',
      'side channel attack',
      'secure multiparty computation',
      'fuzzing',
    ],
    arxivQueries: ['cat:cs.CR'],
  },
  {
    key: 'theory',
    labelZh: '理论',
    labelEn: 'Theory',
    openAlexQueries: [
      'computational complexity',
      'quantum computing algorithm',
      'information theory',
    ],
    arxivQueries: ['cat:cs.CC', 'cat:cs.IT'],
  },
  {
    key: 'database',
    labelZh: '数据库',
    labelEn: 'Database',
    openAlexQueries: [
      'vector database',
      'query optimization',
      'transaction processing',
      'columnar storage',
    ],
    arxivQueries: ['cat:cs.DB'],
  },
  {
    key: 'hci',
    labelZh: '人机交互',
    labelEn: 'HCI',
    openAlexQueries: ['human computer interaction', 'augmented reality interface', 'accessibility'],
    arxivQueries: ['cat:cs.HC'],
  },
]

export const CATEGORY_MAP: Record<PaperCategory, CategoryConfig> = Object.fromEntries(
  CATEGORY_CONFIGS.map((c) => [c.key, c]),
) as Record<PaperCategory, CategoryConfig>

export const ALL_CATEGORY_KEYS: PaperCategory[] = CATEGORY_CONFIGS.map((c) => c.key)
