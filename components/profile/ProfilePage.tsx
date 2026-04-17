'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useConversation } from '@/contexts/ConversationContext'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { t, locale } = useI18n()
  const { user, profile, refreshProfile, requireAuth } = useAuth()
  const { conversations } = useConversation()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nickname: '',
    bio: '',
    institution: '',
    research_field: '',
  })

  const theoryCount = conversations.filter((c) => c.mode === 'theory').length
  const technicalCount = conversations.filter((c) => c.mode === 'technical').length
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0)

  const stats = [
    {
      label: t('profile.stats.chats'),
      value: conversations.length,
      icon: '💬',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: t('profile.stats.theory'),
      value: theoryCount,
      icon: '📚',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: t('profile.stats.technical'),
      value: technicalCount,
      icon: '⚡',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: t('profile.stats.saved'),
      value: totalMessages,
      icon: '⭐',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  const startEdit = useCallback(() => {
    if (!requireAuth()) return
    setForm({
      nickname: profile?.nickname || '',
      bio: profile?.bio || '',
      institution: profile?.institution || '',
      research_field: profile?.research_field || '',
    })
    setIsEditing(true)
  }, [profile, requireAuth])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const saveProfile = useCallback(async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({
        nickname: form.nickname || null,
        bio: form.bio || null,
        institution: form.institution || null,
        research_field: form.research_field || null,
      })
      .eq('id', user.id)

    await refreshProfile()
    setSaving(false)
    setIsEditing(false)
  }, [user, form, refreshProfile])

  const displayName = profile?.nickname || user?.email?.split('@')[0] || '—'
  const avatarLetter = displayName[0].toUpperCase()

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Banner */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${-20 + i * 10}%`,
                left: `${-5 + i * 18}%`,
                opacity: 0.3 - i * 0.04,
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-[var(--chat-bg)] bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {avatarLetter}
          </div>
          <div className="pb-1">
            <h1 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow">
              {displayName}
            </h1>
            <p className="text-white/75 text-xs sm:text-sm">
              {profile?.institution || (locale === 'zh' ? '未设置机构' : 'No institution set')}
              {profile?.research_field ? ` · ${profile.research_field}` : ''}
            </p>
            {user?.email && <p className="text-white/50 text-xs mt-0.5">{user.email}</p>}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={startEdit}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-sm transition-all border border-white/20"
          >
            {t('profile.edit')}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Edit Form */}
        {isEditing && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--accent)]"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t('profile.edit')}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t('profile.field.nickname')}
                </label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  placeholder={t('profile.field.nickname_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t('profile.field.institution')}
                </label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                  placeholder={t('profile.field.institution_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t('profile.field.research_field')}
                </label>
                <input
                  type="text"
                  value={form.research_field}
                  onChange={(e) => setForm((f) => ({ ...f, research_field: e.target.value }))}
                  placeholder={t('profile.field.research_field_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t('profile.field.bio')}
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder={t('profile.field.bio_placeholder')}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm shadow-[var(--shadow-accent)] transition-all disabled:opacity-50"
              >
                {saving ? t('auth.loading') : t('profile.save')}
              </button>
            </div>
          </div>
        )}

        {/* Bio Card (when not editing) */}
        {!isEditing && profile?.bio && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-4 ${s.bg} border border-[var(--border-color)]`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent conversations */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--accent)]"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {t('profile.recent')}
          </h2>
          {conversations.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">
              {t('profile.no_activity')}
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${conv.mode === 'theory' ? 'bg-indigo-400' : 'bg-emerald-400'}`}
                  />
                  <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">
                    {conv.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      conv.mode === 'theory'
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {conv.mode === 'theory' ? t('mode.theory.badge') : t('mode.technical.badge')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
