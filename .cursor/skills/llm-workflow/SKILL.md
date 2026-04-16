---
name: llm-workflow
description: >-
  LLM 大模型与工作流调用集成。封装 LLM API 调用（OpenAI 兼容接口）、
  流式响应处理、工作流编排调用。当涉及大模型 API 调用、Prompt 工程、
  流式响应、工作流触发时使用。
---

# LLM & 工作流集成

## LLM 调用封装

统一使用 OpenAI 兼容接口，支持多种模型提供商。

### 文件结构

```
lib/
  llm-client.ts            → LLM 客户端初始化与配置

services/
  llm.ts                   → LLM 调用核心方法（普通 + 流式）
  workflow.ts              → 工作流 API 调用
  prompt-templates.ts      → Prompt 模板管理

app/api/
  chat/route.ts            → Chat API（流式）
  workflow/run/route.ts    → 工作流执行 API
```

### 流式调用模式

```typescript
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value))
  }
}
```

### API Route 模板

```typescript
// app/api/chat/route.ts
export async function POST(request: Request) {
  const { messages, mode } = await request.json()

  // 根据 mode 选择不同策略
  if (mode === 'theory') {
    return handleTheoryChat(messages)
  }
  return handlePracticeChat(messages) // RAG 模式
}
```

## 环境变量

```env
LLM_API_KEY=your-api-key
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
WORKFLOW_API_BASE_URL=your-workflow-api-url
WORKFLOW_API_KEY=your-workflow-api-key
```

## Prompt 管理

- 系统 Prompt 按模式区分（理论 / 实践）
- 实践模式的 Prompt 包含检索到的上下文
- Prompt 模板使用模板字符串，变量用 `${variable}` 插入
