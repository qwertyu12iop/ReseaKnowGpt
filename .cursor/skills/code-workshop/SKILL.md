---
name: code-workshop
description: >-
  代码小工房（Workshop）模块。通过调用工作流实现趣味编程工具和代码生成功能。
  包括代码可视化、算法演示、代码转换等趣味功能。
  当开发工坊页面、工作流调用、趣味代码工具时使用。
---

# 代码小工房（Workshop）

## 模块定位

提供趣味性 + 实用性的编程工具集，每个工具通过调用后端工作流实现。

## 工具示例

| 工具         | 描述                    | 工作流类型 |
| ------------ | ----------------------- | ---------- |
| 代码解释器   | 逐行解释代码含义        | LLM 工作流 |
| 正则可视化   | 正则表达式可视化 + 测试 | 本地 + LLM |
| SQL 生成器   | 自然语言转 SQL          | LLM 工作流 |
| API 文档生成 | 代码生成 API 文档       | LLM 工作流 |
| 代码重构建议 | 分析代码并给出优化建议  | LLM 工作流 |

## 文件结构

```
components/workshop/
  WorkshopPage.tsx         → 工坊主页（工具卡片网格）
  ToolCard.tsx             → 工具卡片组件
  ToolRunner.tsx           → 工具运行界面
  CodeEditor.tsx           → 代码编辑器（Monaco 或 CodeMirror）
  ResultPanel.tsx          → 结果展示面板

services/
  workflow.ts              → 工作流调用统一封装
  workshop-tools.ts        → 各工具的配置和参数定义

types/
  workshop.ts              → 工具、工作流相关类型
```

## 工作流调用模式

```typescript
interface WorkflowRequest {
  toolId: string
  inputs: Record<string, unknown>
}

interface WorkflowResponse {
  output: string
  metadata?: Record<string, unknown>
}

async function runWorkflow(request: WorkflowRequest): Promise<WorkflowResponse> {
  const response = await fetch('/api/workflow/run', {
    method: 'POST',
    body: JSON.stringify(request),
  })
  return response.json()
}
```

## UI 交互

- 工具列表用卡片网格展示，支持搜索
- 每个工具有独立的输入区（代码编辑器 / 文本框）和结果展示区
- 支持结果复制、下载、分享
