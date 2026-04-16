'use client'

import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'

const PAPERS = [
  {
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    venue: 'NeurIPS',
    tags: ['AI/ML', 'Transformer', 'NLP'],
    abstract: '提出了 Transformer 架构，完全基于注意力机制，彻底改变了 NLP 领域。',
    abstractEn:
      'Proposed the Transformer architecture based solely on attention mechanisms, revolutionizing NLP.',
    category: 'ai',
  },
  {
    title: 'MapReduce: Simplified Data Processing on Large Clusters',
    authors: 'Dean & Ghemawat',
    year: 2004,
    venue: 'OSDI',
    tags: ['Systems', 'Distributed', 'Big Data'],
    abstract: 'Google 提出的大规模并行数据处理编程模型，奠定了大数据处理基础。',
    abstractEn:
      "Google's programming model for large-scale parallel data processing, foundational to big data.",
    category: 'systems',
  },
  {
    title: "Dynamo: Amazon's Highly Available Key-value Store",
    authors: 'DeCandia et al.',
    year: 2007,
    venue: 'SOSP',
    tags: ['Systems', 'Distributed', 'Database'],
    abstract: 'Amazon 设计的高可用键值存储系统，介绍了最终一致性和一致性哈希。',
    abstractEn:
      "Amazon's highly available key-value store introducing eventual consistency and consistent hashing.",
    category: 'systems',
  },
  {
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He et al.',
    year: 2016,
    venue: 'CVPR',
    tags: ['AI/ML', 'Deep Learning', 'Computer Vision'],
    abstract: '提出残差网络 ResNet，通过跳跃连接解决深度神经网络的退化问题。',
    abstractEn:
      'Proposed ResNet with skip connections to solve the degradation problem in deep neural networks.',
    category: 'ai',
  },
  {
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    authors: 'Satoshi Nakamoto',
    year: 2008,
    venue: 'Cryptography Mailing List',
    tags: ['Security', 'Blockchain', 'Cryptography'],
    abstract: '比特币白皮书，描述了去中心化电子货币系统和区块链技术。',
    abstractEn:
      'The Bitcoin whitepaper describing a decentralized electronic cash system using blockchain.',
    category: 'security',
  },
  {
    title: 'The Google File System',
    authors: 'Ghemawat et al.',
    year: 2003,
    venue: 'SOSP',
    tags: ['Systems', 'Distributed', 'Storage'],
    abstract: 'Google 分布式文件系统 GFS 的设计论文，影响了现代分布式存储系统。',
    abstractEn:
      "Design paper for Google's distributed file system GFS, influencing modern distributed storage.",
    category: 'systems',
  },
]

const CATEGORIES = [
  { key: 'all', labelZh: '全部', labelEn: 'All' },
  { key: 'ai', labelZh: 'AI/ML', labelEn: 'AI/ML' },
  { key: 'systems', labelZh: '系统', labelEn: 'Systems' },
  { key: 'algorithms', labelZh: '算法', labelEn: 'Algorithms' },
  { key: 'network', labelZh: '网络', labelEn: 'Network' },
  { key: 'security', labelZh: '安全', labelEn: 'Security' },
]

export default function LiteraturePage() {
  const { t, locale } = useI18n()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = PAPERS.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--chat-surface)] to-[var(--chat-bg)] border-b border-[var(--border-color)] px-4 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow shadow-blue-500/20">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {t('literature.title')}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">{t('literature.subtitle')}</p>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {t('literature.coming_soon')}
            </span>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('literature.search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeCategory === cat.key
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--chat-surface)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                }`}
              >
                {locale === 'zh' ? cat.labelZh : cat.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paper grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
        {filtered.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-16">
            {locale === 'zh' ? '暂无匹配结果' : 'No results found'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((paper) => (
              <div
                key={paper.title}
                className="group rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                    {paper.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  {paper.authors} · {paper.venue} {paper.year}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">
                  {locale === 'zh' ? paper.abstract : paper.abstractEn}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {paper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)]"
                    >
                      {tag}
                    </span>
                  ))}
                  <div className="ml-auto flex gap-1.5">
                    <button
                      className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[var(--accent-light)] text-[var(--accent)] opacity-60 cursor-not-allowed"
                      disabled
                    >
                      {t('literature.read')}
                    </button>
                    <button
                      className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-[var(--border-color)] text-[var(--text-muted)] opacity-60 cursor-not-allowed"
                      disabled
                    >
                      {t('literature.save')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-[var(--border-color)] p-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            {locale === 'zh'
              ? '✦ 后续将接入真实论文数据库，支持 AI 摘要、引用分析与知识图谱'
              : '✦ Real paper database with AI summaries, citation analysis and knowledge graph coming soon'}
          </p>
        </div>
      </div>
    </div>
  )
}
