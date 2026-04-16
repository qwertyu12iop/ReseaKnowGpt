---
name: chat-theory-practice
description: >-
  Chat 模块的理论基础与技术实践双模式开发。理论基础模式通过调用大模型或工作流回答学术问题；
  技术实践模式通过 RAG 技术结合 Supabase 向量检索回答技术问题。
  当开发 Chat 聊天界面、消息流、对话管理、或区分理论/实践两种回答模式时使用。
---

# Chat 理论基础 & 技术实践

## 模块概览

Chat 模块有两种回答模式：

| 模式         | 数据源          | 实现方式                              |
| ------------ | --------------- | ------------------------------------- |
| **理论基础** | LLM / 工作流    | 直接调用大模型 API 或编排好的工作流   |
| **技术实践** | Supabase 知识库 | RAG：先做向量检索，再将上下文注入 LLM |

## 文件结构

```
components/chat/
  ChatArea.tsx          → 聊天主区域（含模式切换）
  ChatInput.tsx         → 输入框组件
  ChatMessage.tsx       → 消息气泡组件
  ChatModeSwitch.tsx    → 理论/实践模式切换
  ChatSidebar.tsx       → 会话列表侧栏

services/
  chat-theory.ts        → 理论模式：调用 LLM / 工作流
  chat-practice.ts      → 实践模式：RAG 检索 + LLM

hooks/
  use-chat.ts           → 聊天状态管理 Hook
  use-streaming.ts      → SSE / 流式响应 Hook

types/
  chat.ts               → 消息、会话、模式等类型定义
```

## 理论模式流程

```
用户输入 → 构造 Prompt → 调用 LLM API → 流式返回 → 渲染消息
```

## 技术实践流程（RAG）

```
用户输入 → Embedding 向量化
        → Supabase pgvector 相似度检索（match_documents）
        → 拼装上下文 + 用户问题
        → 调用 LLM API
        → 流式返回 → 渲染消息（附带引用来源）
```

## 关键实现要点

1. **流式响应**：使用 SSE（Server-Sent Events）或 ReadableStream 实现打字机效果
2. **会话管理**：通过 ConversationContext 管理多轮对话
3. **模式切换**：UI 上提供明确的切换按钮，不同模式使用不同 service
4. **引用溯源**：技术实践模式下，返回结果需标注引用来源（文献名称 + 页码）
5. **历史记录**：会话持久化到 Supabase 的 conversations / messages 表
