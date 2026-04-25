'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import WorkshopToolBase, { type HistoryItem } from './WorkshopToolBase'
import { streamWorkshop } from '@/services/workshop'

export default function CodeGenerateTool() {
  const { t } = useI18n()
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])

  const handleGenerate = useCallback(
    async (lang: string, req: string) => {
      setLoading(true)
      setError('')
      setOutput('')

      try {
        const result = await streamWorkshop({
          path: '/api/workshop/code-generate',
          body: { lang, req },
          onDelta: (chunk) => {
            setOutput((prev) => prev + chunk)
          },
        })

        if (result) {
          setHistory((prev) => [
            { lang, input: req, output: result, timestamp: Date.now() },
            ...prev.slice(0, 9),
          ])
        }
      } catch {
        setError('failed')
      } finally {
        setLoading(false)
      }
    },
    []
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
      errorText={t('workshop.codegen.error')}
      maxLines={0}
      onSubmit={handleGenerate}
      history={history}
      loading={loading}
      output={output}
      error={error}
    />
  )
}
