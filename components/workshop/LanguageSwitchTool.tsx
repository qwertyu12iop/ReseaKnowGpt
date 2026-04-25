'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import WorkshopToolBase, { type HistoryItem } from './WorkshopToolBase'
import { streamWorkshop } from '@/services/workshop'

export default function LanguageSwitchTool() {
  const { t } = useI18n()
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])

  const handleSwitch = useCallback(
    async (lang: string, code: string) => {
      setLoading(true)
      setError('')
      setOutput('')

      try {
        const result = await streamWorkshop({
          path: '/api/workshop/language-switch',
          body: { lang, code },
          onDelta: (chunk) => {
            setOutput((prev) => prev + chunk)
          },
        })

        if (result) {
          setHistory((prev) => [
            { lang, input: code, output: result, timestamp: Date.now() },
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
      title={t('workshop.langswitch.title')}
      desc={t('workshop.langswitch.desc')}
      gradient="from-amber-500 to-orange-600"
      shadowColor="shadow-amber-500/20"
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
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      }
      langLabel={t('workshop.langswitch.target_lang_label')}
      inputLabel={t('workshop.langswitch.code_label')}
      inputPlaceholder={t('workshop.langswitch.code_placeholder')}
      submitText={t('workshop.langswitch.submit')}
      switchingText={t('workshop.langswitch.switching')}
      resultTitle={t('workshop.langswitch.result_title')}
      copyText={t('workshop.langswitch.copy')}
      copiedText={t('workshop.langswitch.copied')}
      emptyText={t('workshop.langswitch.empty_result')}
      clearText={t('workshop.langswitch.clear')}
      historyText={t('workshop.langswitch.history')}
      errorText={t('workshop.langswitch.error')}
      maxLines={500}
      onSubmit={handleSwitch}
      history={history}
      loading={loading}
      output={output}
      error={error}
    />
  )
}
