#!/bin/bash
# RAG 知识库爬取脚本
# 用法: ./scripts/crawl.sh
# 前提: pnpm dev 已启动（端口 3005）

API="http://localhost:3005/api/rag/crawl"
SECRET="openself567"

urls=(
  # ── React ──
  "https://react.dev/learn"
  "https://react.dev/reference/react/hooks"
  "https://react.dev/learn/managing-state"

  # ── Next.js ──
  "https://nextjs.org/docs/getting-started/installation"
  "https://nextjs.org/docs/app/building-your-application/routing"
  "https://nextjs.org/docs/app/building-your-application/data-fetching"

  # ── TypeScript ──
  "https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
  "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html"

  # ── Docker ──
  "https://docs.docker.com/get-started/overview/"
  "https://docs.docker.com/compose/gettingstarted/"

  # ── PostgreSQL ──
  "https://www.postgresql.org/docs/current/sql-select.html"
  "https://www.postgresql.org/docs/current/indexes.html"

  # ── Tailwind CSS ──
  "https://tailwindcss.com/docs/utility-first"
  "https://tailwindcss.com/docs/responsive-design"

  # ── Git ──
  "https://git-scm.com/book/zh/v2/Git-分支-分支简介"

  # ── Node.js ──
  "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs"
)

total=${#urls[@]}
success=0
fail=0

echo "=========================================="
echo "  RAG 知识库批量爬取（共 ${total} 个页面）"
echo "=========================================="
echo ""

for i in "${!urls[@]}"; do
  url="${urls[$i]}"
  idx=$((i + 1))
  echo "[${idx}/${total}] 爬取: ${url}"

  response=$(curl -s -w "\n%{http_code}" -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${SECRET}" \
    -d "{\"url\": \"${url}\"}" \
    --max-time 120)

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ]; then
    chunks=$(echo "$body" | grep -o '"chunkCount":[0-9]*' | cut -d: -f2)
    title=$(echo "$body" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ 成功 | ${title} | ${chunks} 个分块"
    success=$((success + 1))
  else
    error=$(echo "$body" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "  ❌ 失败 (HTTP ${http_code}) | ${error}"
    fail=$((fail + 1))
  fi

  # 间隔 3 秒，避免过快请求
  if [ $idx -lt $total ]; then
    sleep 3
  fi
done

echo ""
echo "=========================================="
echo "  完成！成功: ${success}  失败: ${fail}"
echo "=========================================="
