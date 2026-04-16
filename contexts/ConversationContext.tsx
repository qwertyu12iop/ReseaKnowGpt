'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ChatMode, Conversation, Message } from '@/types/chat';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildTitle(content: string): string {
  return content.length > 32 ? content.slice(0, 32) + '…' : content;
}

interface ConversationContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  mode: ChatMode;
  isLoading: boolean;
  setMode: (mode: ChatMode) => void;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string) => void;
  deleteConversation: (id: string) => void;
  newChat: () => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>('theory');
  const [isLoading] = useState(false);

  const newChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveConversationId((prev) => (prev === id ? null : prev));
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const userMsg: Message = {
        id: genId(),
        role: 'user',
        content,
        mode,
        timestamp: new Date(),
      };

      if (!activeConversationId) {
        const newConv: Conversation = {
          id: genId(),
          title: buildTitle(content),
          messages: [userMsg],
          mode,
          createdAt: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? { ...c, messages: [...c.messages, userMsg] }
              : c
          )
        );
      }
    },
    [activeConversationId, mode]
  );

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversationId,
        mode,
        isLoading,
        setMode,
        setActiveConversationId,
        sendMessage,
        deleteConversation,
        newChat,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversation must be used within ConversationProvider');
  return ctx;
}
