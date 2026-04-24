import type { PaperCategory } from '@/types/paper'

/**
 * 每个分类对应的检索关键词组。
 * - OpenAlex（英文）：按关键词 search，按引用数排序，拉高被引论文
 * - OpenAlex（中文）：同上，附加 language:zh 过滤，拉取中文期刊论文
 * - arXiv：按分类标签（cat:cs.AI）+ 关键词，拉最新预印本
 * - ChinaXiv：按 OAI-PMH subject set 拉取中国预印本，填 set 名称
 */
export interface CategoryConfig {
  key: PaperCategory
  labelZh: string
  labelEn: string
  /** OpenAlex 检索关键词（英文论文） */
  openAlexQueries: string[]
  /**
   * OpenAlex 检索关键词（中文论文）。
   * 爬取时会附加 language:zh 过滤，
   * 关键词用英文即可（OpenAlex 支持跨语言语义搜索）。
   */
  openAlexChineseQueries: string[]
  /** arXiv 检索表达式，使用 arXiv 官方语法 */
  arxivQueries: string[]
  /**
   * ChinaXiv OAI-PMH subject set 列表（如 'cs'）。
   * 同一分类下多个 set 会分别拉取后去重合并。
   * 留空数组则不从 ChinaXiv 爬取该分类。
   */
  chinaxivSets: string[]
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
    openAlexChineseQueries: [
      'large language model',
      'deep learning neural network',
      'knowledge graph',
      'natural language processing',
    ],
    arxivQueries: ['cat:cs.AI', 'cat:cs.LG', 'cat:cs.CL'],
    chinaxivSets: ['cs'],
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
    openAlexChineseQueries: [
      'distributed computing system',
      'cloud computing architecture',
      'operating system',
    ],
    arxivQueries: ['cat:cs.OS', 'cat:cs.DC'],
    chinaxivSets: ['cs'],
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
    openAlexChineseQueries: [
      'graph algorithm optimization',
      'sorting algorithm',
      'dynamic programming',
    ],
    arxivQueries: ['cat:cs.DS'],
    chinaxivSets: [],
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
    openAlexChineseQueries: [
      '5G network',
      'software defined networking',
      'wireless communication',
      'network security protocol',
    ],
    arxivQueries: ['cat:cs.NI'],
    chinaxivSets: [],
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
    openAlexChineseQueries: [
      'network security intrusion detection',
      'cryptography encryption',
      'vulnerability detection',
    ],
    arxivQueries: ['cat:cs.CR'],
    chinaxivSets: [],
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
    openAlexChineseQueries: [
      'quantum computing',
      'computational complexity theory',
      'information theory coding',
    ],
    arxivQueries: ['cat:cs.CC', 'cat:cs.IT'],
    chinaxivSets: [],
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
    openAlexChineseQueries: [
      'database query optimization',
      'big data storage',
      'distributed database',
    ],
    arxivQueries: ['cat:cs.DB'],
    chinaxivSets: [],
  },
  {
    key: 'hci',
    labelZh: '人机交互',
    labelEn: 'HCI',
    openAlexQueries: ['human computer interaction', 'augmented reality interface', 'accessibility'],
    openAlexChineseQueries: [
      'human computer interaction',
      'user interface design',
      'virtual reality interaction',
    ],
    arxivQueries: ['cat:cs.HC'],
    chinaxivSets: [],
  },
]

export const CATEGORY_MAP: Record<PaperCategory, CategoryConfig> = Object.fromEntries(
  CATEGORY_CONFIGS.map((c) => [c.key, c]),
) as Record<PaperCategory, CategoryConfig>

export const ALL_CATEGORY_KEYS: PaperCategory[] = CATEGORY_CONFIGS.map((c) => c.key)
