'use client';

import { Conversation } from '@/types/chat';
import ConversationItem from './ConversationItem';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  isOpen,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onClose,
}: SidebarProps) {
  const grouped = groupByDate(conversations);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo & New Chat */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              ReseaKnowGPT
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 py-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-all duration-150 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新建对话
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] text-xs mt-8 px-4">
              暂无对话记录
            </p>
          ) : (
            Object.entries(grouped).map(([label, items]) => (
              <div key={label} className="mb-4">
                <p className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {items.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      onClick={() => onSelectConversation(conv.id)}
                      onDelete={onDeleteConversation}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
              CS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">计算机专业助手</p>
              <p className="text-[10px] text-[var(--text-muted)]">GPT-4o · DeepSeek</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {};

  for (const conv of [...conversations].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )) {
    const d = new Date(conv.createdAt.getFullYear(), conv.createdAt.getMonth(), conv.createdAt.getDate());
    let label: string;
    if (d >= today) label = '今天';
    else if (d >= yesterday) label = '昨天';
    else if (d >= lastWeek) label = '最近 7 天';
    else label = '更早';

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return groups;
}
