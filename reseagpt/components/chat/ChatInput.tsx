'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ChatMode } from '@/types/chat';
import { useI18n } from '@/contexts/I18nContext';

interface ChatInputProps {
  mode: ChatMode;
  isLoading: boolean;
  initialValue?: string;
  onSend: (content: string) => void;
}

export default function ChatInput({ mode, isLoading, initialValue = '', onSend }: ChatInputProps) {
  const { t } = useI18n();
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isTheory = mode === 'theory';
  const placeholder = isTheory ? t('chat.input.theory.placeholder') : t('chat.input.technical.placeholder');

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-end gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3 transition-colors duration-200 focus-within:border-[var(--accent)]/50 border-[var(--border-color)]`}>
          <div className={`shrink-0 mb-1.5 w-2 h-2 rounded-full ${isTheory ? 'bg-indigo-400' : 'bg-emerald-400'}`} />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed py-0 disabled:opacity-50"
            style={{ minHeight: '24px', maxHeight: '200px' }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`shrink-0 mb-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading
                ? isTheory
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'bg-[var(--chat-surface)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-[var(--text-muted)] mt-1.5">
          {t('chat.input.hint')}
        </p>
      </div>
    </div>
  );
}
