'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import WorkshopToolBase, { type HistoryItem } from './WorkshopToolBase'

export default function LanguageSwitchTool() {
  const { t, locale } = useI18n()
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const handleSwitch = useCallback(
    async (lang: string, code: string) => {
      setLoading(true)
      setError('')
      setOutput('')
      setCopied(false)

      try {
        const res = await fetch('/api/workshop/language-switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, code }),
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
            { lang, input: code, output: result, timestamp: Date.now() },
            ...prev.slice(0, 9),
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('workshop.langswitch.error'))
      } finally {
        setLoading(false)
      }
    },
    [t, locale]
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
      maxLines={500}
      onSubmit={handleSwitch}
      history={history}
      loading={loading}
      output={output}
      error={error}
      copied={copied}
    />
  )
}
