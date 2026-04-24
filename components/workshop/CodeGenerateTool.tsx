'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import WorkshopToolBase, { LANGUAGES, type HistoryItem } from './WorkshopToolBase'

export default function CodeGenerateTool() {
  const { t, locale } = useI18n()
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const handleGenerate = useCallback(
    async (lang: string, req: string) => {
      setLoading(true)
      setError('')
      setOutput('')
      setCopied(false)

      try {
        const res = await fetch('/api/workshop/code-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, req }),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(
            data.error || (locale === 'zh' ? `请求失败：${res.status}` : `Request failed: ${res.status}`)
          )
        }

        const data = (await res.json()) as { output?: string }
        const result = data.output ?? ''
        setOutput(result)
        setCopied(false)

        if (result) {
          setHistory((prev) => [
            { lang, input: req, output: result, timestamp: Date.now() },
            ...prev.slice(0, 9),
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('workshop.codegen.error'))
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  return (
    <WorkshopToolBase
      title={t('workshop.codegen.title')}
      desc={t('workshop.codegen.desc')}
      gradient="from-indigo-500 to-purple-600"
      shadowColor="shadow-indigo-500/20"
      icon={
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      }
      langLabel={t('workshop.codegen.lang_label')}
      inputLabel={t('workshop.codegen.req_label')}
      inputPlaceholder={t('workshop.codegen.req_placeholder')}
      submitText={t('workshop.codegen.submit')}
      switchingText={t('workshop.codegen.generating')}
      resultTitle={t('workshop.codegen.result_title')}
      copyText={t('workshop.codegen.copy')}
      copiedText={t('workshop.codegen.copied')}
      emptyText={t('workshop.codegen.empty_result')}
      clearText={t('workshop.codegen.clear')}
      historyText={t('workshop.codegen.history')}
      maxLines={0}
      onSubmit={handleGenerate}
      history={history}
      loading={loading}
      output={output}
      error={error}
      copied={copied}
    />
  )
}
