'use client';

import { useState, useCallback } from 'react';
import { ChatMode, Conversation, Message } from '@/types/chat';
import Sidebar from '@/components/sidebar/Sidebar';
import ModeSelector from './ModeSelector';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildTitle(content: string): string {
  return content.length > 30 ? content.slice(0, 30) + '…' : content;
}

export default function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>('theory');
  const [isLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptValue, setPromptValue] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  const handleNewChat = useCallback(() => {
    setActiveId(null);
    setPromptValue('');
    setSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const handleModeChange = useCallback((newMode: ChatMode) => {
    setMode(newMode);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      const userMsg: Message = {
        id: genId(),
        role: 'user',
        content,
        mode,
        timestamp: new Date(),
      };

      if (!activeId) {
        const newConv: Conversation = {
          id: genId(),
          title: buildTitle(content),
          messages: [userMsg],
          mode,
          createdAt: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId ? { ...c, messages: [...c.messages, userMsg] } : c
          )
        );
      }

      setPromptValue('');
    },
    [activeId, mode]
  );

  const handlePromptClick = useCallback((prompt: string) => {
    setPromptValue(prompt);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--chat-bg)]">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeId}
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--chat-bg)] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--chat-surface)] transition-colors"
              aria-label="打开侧边栏"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-sm font-medium text-[var(--text-secondary)] truncate max-w-[160px] sm:max-w-xs">
              {activeConversation ? activeConversation.title : '新建对话'}
            </span>
          </div>

          <ModeSelector mode={mode} onChange={handleModeChange} />
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto">
              <WelcomeScreen mode={mode} onPromptClick={handlePromptClick} />
            </div>
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}

          <ChatInput
            mode={mode}
            isLoading={isLoading}
            initialValue={promptValue}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
