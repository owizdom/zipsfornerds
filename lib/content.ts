import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { lintPublished } from './lint'

export type Article = {
  slug: string
  title: string
  subtitle: string
  seriesNumber: number
  zip: number
  zipStatus: string
  zipCategory: string
  specUrl: string
  date: string
  status: 'draft' | 'published'
  cover: string
  tag: string
  reviewedBy: string
  disclosure: string
  corrections: string[]
  readingMinutes: number
  html: string
  outline: { id: string; text: string }[]
}

const articlesDir = () => path.resolve(process.cwd(), process.env.ARTICLES_DIR || 'articles')
export const showDrafts = () => process.env.SHOW_DRAFTS === '1'

const toIsoDate = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10))

function render(markdown: string): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeStringify)
      .processSync(markdown),
  )
}

// A paragraph holding only an image with a title becomes a captioned figure.
const figures = (html: string) =>
  html.replace(/<p><img src="([^"]+)" alt="([^"]*)" title="([^"]*)"><\/p>/g, (_m, src, alt, title) =>
    `<figure><img src="${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${title}</figcaption></figure>`)

function load(file: string): Article {
  const raw = fs.readFileSync(path.join(articlesDir(), file), 'utf8')
  const { data, content } = matter(raw)
  // The publish gate runs inside the production build too, so an edit made in the CMS
  // cannot put a published article live if it fails lint. The build fails and the last good deploy stays up.
  if (data.status === 'published' && process.env.NODE_ENV === 'production') {
    const violations = lintPublished(raw)
    if (violations.length) throw new Error(`Publish gate: ${file} is published but fails lint:\n  ${violations.slice(0, 8).join('\n  ')}`)
  }
  const html = figures(render(content))
  const outline = [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)]
    .map((m) => ({ id: m[1], text: m[2].replace(/<[^>]+>/g, '') }))
    .filter((h) => h.text !== 'Sources')
  return {
    slug: file.replace(/\.md$/, ''),
    title: data.title,
    subtitle: data.subtitle ?? '',
    seriesNumber: Number(data.series_number),
    zip: Number(data.zip),
    zipStatus: data.zip_status,
    zipCategory: data.zip_category,
    specUrl: data.spec_url,
    date: toIsoDate(data.date),
    status: data.status === 'published' ? 'published' : 'draft',
    cover: data.cover ?? '',
    tag: data.tag ?? '',
    reviewedBy: data.reviewed_by ?? '',
    disclosure: data.disclosure ?? '',
    corrections: Array.isArray(data.corrections) ? data.corrections.map(String) : [],
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 230)),
    html,
    outline,
  }
}

export function getArticles(opts: { includeDrafts?: boolean } = {}): Article[] {
  const includeDrafts = opts.includeDrafts ?? showDrafts()
  if (!fs.existsSync(articlesDir())) return []
  return fs
    .readdirSync(articlesDir())
    .filter((f) => f.endsWith('.md'))
    .map(load)
    .filter((a) => includeDrafts || a.status === 'published')
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.seriesNumber - a.seriesNumber))
}

export function getArticle(slug: string): Article | null {
  return getArticles().find((a) => a.slug === slug) ?? null
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
