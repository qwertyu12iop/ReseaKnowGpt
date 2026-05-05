'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useI18n } from '@/contexts/I18nContext'
import type { TranslationKey } from '@/locales'

interface PaperRow {
  id: number
  external_id: string
  source: string
  title: string
  authors: string[]
  abstract: string | null
  year: number | null
  venue: string | null
  doi: string | null
  url: string
  pdf_url: string | null
  category: string
  tags: string[]
  cited_by_count: number
  is_open_access: boolean
  created_at: string
}

const CAT_KEYS: { value: string; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'admin.cat_all' },
  { value: 'ai', labelKey: 'admin.cat_ai' },
  { value: 'systems', labelKey: 'admin.cat_systems' },
  { value: 'algorithms', labelKey: 'admin.cat_algorithms' },
  { value: 'network', labelKey: 'admin.cat_network' },
  { value: 'security', labelKey: 'admin.cat_security' },
  { value: 'theory', labelKey: 'admin.cat_theory' },
  { value: 'database', labelKey: 'admin.cat_database' },
  { value: 'hci', labelKey: 'admin.cat_hci' },
]

const SOURCES = [
  { value: 'openalex', label: 'OpenAlex' },
  { value: 'arxiv', label: 'arXiv' },
  { value: 'chinaxiv', label: 'ChinaXiv' },
  { value: 'semantic_scholar', label: 'Semantic Scholar' },
]

const EMPTY_FORM: Omit<PaperRow, 'id' | 'created_at' | 'cited_by_count' | 'is_open_access'> = {
  external_id: '',
  source: 'openalex',
  title: '',
  authors: [],
  abstract: null,
  year: null,
  venue: null,
  doi: null,
  url: '',
  pdf_url: null,
  category: 'ai',
  tags: [],
}

export default function AdminPapersPage() {
  const { t } = useI18n()
  const [papers, setPapers] = useState<PaperRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPaper, setEditingPaper] = useState<PaperRow | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formAuthors, setFormAuthors] = useState('')
  const [formTags, setFormTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const pageSize = 15

  const fetchPapers = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        category,
        ...(search ? { search } : {}),
      })

      const res = await fetch(`/api/admin/papers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setPapers(data.items)
        setTotal(data.total)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, category])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  function openCreate() {
    setEditingPaper(null)
    setFormData(EMPTY_FORM)
    setFormAuthors('')
    setFormTags('')
    setShowModal(true)
  }

  function openEdit(paper: PaperRow) {
    setEditingPaper(paper)
    setFormData({
      external_id: paper.external_id,
      source: paper.source,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      year: paper.year,
      venue: paper.venue,
      doi: paper.doi,
      url: paper.url,
      pdf_url: paper.pdf_url,
      category: paper.category,
      tags: paper.tags,
    })
    setFormAuthors(paper.authors.join(', '))
    setFormTags(paper.tags.join(', '))
    setShowModal(true)
  }

  async function handleSave() {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setSaving(true)
    try {
      const payload = {
        ...formData,
        authors: formAuthors.split(',').map((s) => s.trim()).filter(Boolean),
        tags: formTags.split(',').map((s) => s.trim()).filter(Boolean),
        year: formData.year ? Number(formData.year) : null,
      }

      const isEdit = !!editingPaper
      const res = await fetch('/api/admin/papers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(isEdit ? { id: editingPaper.id, ...payload } : payload),
      })

      if (res.ok) {
        setShowModal(false)
        fetchPapers()
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('admin.delete_confirm'))) return

    const token = localStorage.getItem('admin_token')
    if (!token) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/papers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) fetchPapers()
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)
  const catLabel = (val: string) => {
    const found = CAT_KEYS.find((c) => c.value === val)
    return found ? t(found.labelKey) : val
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('admin.papers')}</h1>
            <p className="text-white/50 text-sm mt-1">
              {t('admin.papers_desc').replace('{count}', String(total))}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('admin.add_paper_btn')}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('admin.search_papers')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
          >
            {CAT_KEYS.map((c) => (
              <option key={c.value} value={c.value} className="bg-slate-800">{t(c.labelKey)}</option>
            ))}
          </select>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_title')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_source')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_category')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_year')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_citations')}</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[200, 80, 60, 50, 40, 100].map((w, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-white/10 animate-pulse" style={{ width: w }} /></td>
                      ))}
                    </tr>
                  ))
                ) : papers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-white/40 text-sm">{t('admin.no_papers')}</td>
                  </tr>
                ) : (
                  papers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium max-w-xs truncate" title={paper.title}>{paper.title}</p>
                        <p className="text-xs text-white/40 mt-0.5 truncate max-w-xs">{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' ...' : ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{paper.source}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-white/60">{catLabel(paper.category)}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">{paper.year ?? '-'}</td>
                      <td className="px-5 py-4 text-sm text-white/60">{paper.cited_by_count}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(paper)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all" title={t('admin.edit')}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(paper.id)} disabled={deleting === paper.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all disabled:opacity-30" title={t('admin.delete')}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <p className="text-sm text-white/40">
                {t('admin.page_info').replace('{page}', String(page)).replace('{total}', String(totalPages))}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all">{t('admin.prev_page')}</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all">{t('admin.next_page')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <PaperFormModal
          t={t}
          catKeys={CAT_KEYS}
          formData={formData}
          setFormData={setFormData}
          formAuthors={formAuthors}
          setFormAuthors={setFormAuthors}
          formTags={formTags}
          setFormTags={setFormTags}
          isEdit={!!editingPaper}
          saving={saving}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </AdminLayout>
  )
}

function PaperFormModal({
  t,
  catKeys,
  formData,
  setFormData,
  formAuthors,
  setFormAuthors,
  formTags,
  setFormTags,
  isEdit,
  saving,
  onSave,
  onClose,
}: {
  t: (key: TranslationKey) => string
  catKeys: typeof CAT_KEYS
  formData: typeof EMPTY_FORM
  setFormData: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  formAuthors: string
  setFormAuthors: (v: string) => void
  formTags: string
  setFormTags: (v: string) => void
  isEdit: boolean
  saving: boolean
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{isEdit ? t('admin.edit_paper') : t('admin.create_paper')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <FormField label={`${t('admin.field_title')} *`} value={formData.title} onChange={(v) => setFormData((d) => ({ ...d, title: v }))} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">{t('admin.field_source')} *</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData((d) => ({ ...d, source: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none"
              >
                {SOURCES.map((s) => <option key={s.value} value={s.value} className="bg-slate-800">{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">{t('admin.field_category')} *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((d) => ({ ...d, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none"
              >
                {catKeys.filter((c) => c.value !== 'all').map((c) => <option key={c.value} value={c.value} className="bg-slate-800">{t(c.labelKey)}</option>)}
              </select>
            </div>
          </div>

          <FormField label={`${t('admin.field_external_id')} *`} value={formData.external_id} onChange={(v) => setFormData((d) => ({ ...d, external_id: v }))} placeholder={t('admin.placeholder_external_id')} />
          <FormField label={`${t('admin.field_url')} *`} value={formData.url} onChange={(v) => setFormData((d) => ({ ...d, url: v }))} placeholder={t('admin.placeholder_url')} />
          <FormField label={t('admin.field_authors')} value={formAuthors} onChange={setFormAuthors} placeholder={t('admin.placeholder_authors')} />

          <div>
            <label className="block text-sm text-white/60 mb-1.5">{t('admin.field_abstract')}</label>
            <textarea
              value={formData.abstract ?? ''}
              onChange={(e) => setFormData((d) => ({ ...d, abstract: e.target.value || null }))}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none transition-all"
              placeholder={t('admin.placeholder_abstract')}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label={t('admin.field_year')} value={String(formData.year ?? '')} onChange={(v) => setFormData((d) => ({ ...d, year: v ? Number(v) : null }))} placeholder="2024" />
            <FormField label={t('admin.field_venue')} value={formData.venue ?? ''} onChange={(v) => setFormData((d) => ({ ...d, venue: v || null }))} placeholder="NeurIPS" />
            <FormField label={t('admin.field_doi')} value={formData.doi ?? ''} onChange={(v) => setFormData((d) => ({ ...d, doi: v || null }))} placeholder="10.xxxx" />
          </div>

          <FormField label={t('admin.field_pdf_url')} value={formData.pdf_url ?? ''} onChange={(v) => setFormData((d) => ({ ...d, pdf_url: v || null }))} placeholder={t('admin.placeholder_pdf_url')} />
          <FormField label={t('admin.field_tags')} value={formTags} onChange={setFormTags} placeholder={t('admin.placeholder_tags')} />
        </div>

        <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">{t('common.cancel')}</button>
          <button
            onClick={onSave}
            disabled={saving || !formData.title || !formData.url || !formData.external_id}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            {saving ? t('admin.saving') : isEdit ? t('admin.update') : t('admin.create')}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
      />
    </div>
  )
}
