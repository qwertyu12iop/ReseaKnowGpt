import 'server-only'
import puppeteer from 'puppeteer'

export interface CrawlResult {
  url: string
  title: string
  text: string
  charCount: number
}

/**
 * 使用 Puppeteer 无头浏览器爬取指定网页的文本内容
 * - 等待页面完全加载后提取正文
 * - 移除 script/style/nav/footer 等非正文元素
 * - 代码块（pre/code）保留完整内容和格式
 * - 自动处理 SPA 和动态渲染页面
 */
export async function crawlPage(url: string): Promise<CrawlResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    )

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30_000,
    })

    const title = await page.title()

    const text = await page.evaluate(() => {
      const removeSelectors = [
        'script', 'style', 'noscript', 'iframe',
        'nav', 'footer', 'header',
        '[role="navigation"]', '[role="banner"]',
        '.sidebar', '.nav', '.menu', '.footer', '.header',
        '.advertisement', '.ads', '.ad',
        '.cookie-banner', '.popup',
      ]

      for (const selector of removeSelectors) {
        document.querySelectorAll(selector).forEach((el) => el.remove())
      }

      const body = document.body
      if (!body) return ''

      const codeBlocks = new Set<Element>()
      body.querySelectorAll('pre, pre code').forEach((el) => {
        codeBlocks.add(el.closest('pre') ?? el)
      })

      const parts: string[] = []

      function extractNode(node: Node): void {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          const tag = el.tagName.toLowerCase()

          if (['script', 'style', 'noscript', 'svg'].includes(tag)) return

          if (tag === 'pre' || codeBlocks.has(el)) {
            const lang = el.querySelector('code')?.className
              ?.split(/\s+/)
              .find((c) => c.startsWith('language-'))
              ?.replace('language-', '') ?? ''
            const code = el.textContent?.trim() ?? ''
            if (code) {
              const fence = lang ? '```' + lang : '```'
              parts.push(`${fence}\n${code}\n\`\`\``)
            }
            return
          }

          if (tag === 'code' && !el.closest('pre')) {
            const code = el.textContent ?? ''
            if (code.trim()) {
              parts.push('`' + code.trim() + '`')
            }
            return
          }

          const blockTags = [
            'p', 'div', 'section', 'article', 'main',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'li', 'blockquote', 'table', 'tr', 'dt', 'dd',
          ]
          const isBlock = blockTags.includes(tag)

          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
            const level = parseInt(tag[1])
            const heading = el.textContent?.trim() ?? ''
            if (heading) {
              parts.push('#'.repeat(level) + ' ' + heading)
            }
            return
          }

          if (tag === 'li') {
            const text = extractInlineText(el)
            if (text) parts.push('- ' + text)
            return
          }

          for (const child of el.childNodes) {
            extractNode(child)
          }

          if (isBlock && parts.length > 0 && parts[parts.length - 1] !== '') {
            parts.push('')
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim()
          if (text) parts.push(text)
        }
      }

      function extractInlineText(el: Element): string {
        let result = ''
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent ?? ''
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as Element
            const tag = childEl.tagName.toLowerCase()
            if (tag === 'code') {
              result += '`' + (childEl.textContent ?? '') + '`'
            } else if (tag === 'a') {
              result += childEl.textContent ?? ''
            } else if (tag === 'strong' || tag === 'b') {
              result += '**' + (childEl.textContent ?? '') + '**'
            } else if (tag === 'em' || tag === 'i') {
              result += '*' + (childEl.textContent ?? '') + '*'
            } else {
              result += childEl.textContent ?? ''
            }
          }
        }
        return result.trim()
      }

      extractNode(body)

      return parts
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    })

    return {
      url,
      title: title || url,
      text,
      charCount: text.length,
    }
  } finally {
    await browser.close()
  }
}
