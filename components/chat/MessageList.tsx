'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Message } from '@/types/chat'
import { useI18n } from '@/contexts/I18nContext'
import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 sm:gap-4 w-full">
      <div className="shrink-0 mt-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow shadow-indigo-500/20">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--chat-surface)] border border-[var(--border-color)]">
        <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" />
      </div>
    </div>
  )
}

const STICK_THRESHOLD = 80

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  // 是否仍贴底（放 ref 避免 re-render）
  const stickToBottomRef = useRef(true)
  const [showJumpBtn, setShowJumpBtn] = useState(false)

  const updateStickyAndButton = useCallback((stick: boolean) => {
    if (stickToBottomRef.current !== stick) {
      stickToBottomRef.current = stick
    }
    setShowJumpBtn((prev) => (prev === !stick ? prev : !stick))
  }, [])

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // 用户意图事件：立刻解锁（不依赖 scroll 事件，避免被程序滚动干扰）
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // 向上意图信号：wheel 往上、touch 往下拉、PageUp/Home/↑ 等按键
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) updateStickyAndButton(false)
    }
    const onTouchStart = () => {
      // 触屏用户无法判断方向，一旦开始触摸就先假定想滚动，scroll 事件随后会校正
      // 这里什么都不做，交给 scroll 事件判断
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) {
        updateStickyAndButton(false)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('keydown', onKeyDown)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('keydown', onKeyDown)
    }
  }, [updateStickyAndButton])

  // scroll 事件：只允许 "false → true"（用户滚回底部时重新贴底）
  // 绝不允许 "true → false"，避免程序 scrollTo 产生的 scroll 事件干扰用户意图
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let rafId = 0
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const dist = el.scrollHeight - el.scrollTop - el.clientHeight
        const nearBottom = dist <= STICK_THRESHOLD
        // 用户已手动滚回底部附近 → 恢复贴底
        if (nearBottom && !stickToBottomRef.current) {
          updateStickyAndButton(true)
        }
        // 也更新按钮显示（即使不改变 sticky）
        if (!nearBottom && !showJumpBtn) setShowJumpBtn(true)
        if (nearBottom && showJumpBtn) setShowJumpBtn(false)
      })
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', handleScroll)
    }
  }, [showJumpBtn, updateStickyAndButton])

  // 内容变化时跟随（仅贴底状态下）；瞬时滚动避免动画叠加抖动
  useEffect(() => {
    if (stickToBottomRef.current) {
      scrollToBottom(false)
    }
  }, [messages, isLoading, scrollToBottom])

  // 切换对话时强制回底部并重置
  const conversationKey = messages.length > 0 ? messages[0].id : 'empty'
  useEffect(() => {
    stickToBottomRef.current = true
    setShowJumpBtn(false)
    requestAnimationFrame(() => scrollToBottom(false))
  }, [conversationKey, scrollToBottom])

  const jumpToBottom = useCallback(() => {
    stickToBottomRef.current = true
    setShowJumpBtn(false)
    scrollToBottom(true)
  }, [scrollToBottom])

  const last = messages[messages.length - 1]
  const showIndicator = isLoading && (!last || last.role === 'user' || last.content.length === 0)

  return (
    <div ref={scrollRef} tabIndex={-1} className="relative flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {showIndicator && <TypingIndicator />}
      </div>

      <button
        onClick={jumpToBottom}
        title={t('chat.scroll.jump')}
        aria-label={t('chat.scroll.jump')}
        className={`sticky bottom-3 float-right mr-2 -mt-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--chat-surface)] backdrop-blur-md border border-[var(--border-color)] text-xs text-[var(--text-secondary)] shadow-lg transition-all duration-200 cursor-pointer hover:text-[var(--text-primary)] hover:border-[var(--accent)] ${
          showJumpBtn ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {t('chat.scroll.jump')}
      </button>
    </div>
  )
}
