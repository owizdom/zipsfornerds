import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticle, getArticles, formatDate } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = getArticles().map((a) => ({ slug: a.slug }))
  // Static export needs at least one param; the placeholder renders the 404 page.
  return slugs.length ? slugs : [{ slug: '_none' }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) return {}
  return {
    title: a.title,
    description: a.subtitle,
    alternates: { canonical: `/articles/${a.slug}/` },
    openGraph: { type: 'article', title: a.title, description: a.subtitle, url: `/articles/${a.slug}/`, publishedTime: a.date },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) notFound()
  return (
    <article className="wrap article">
      <p className="back label"><Link href="/#articles">← All articles</Link></p>
      <p className="label">ZIPs For Nerds #{a.seriesNumber} · {formatDate(a.date)} · {a.readingMinutes} min read{a.status === 'draft' ? ' · UNPUBLISHED PREVIEW' : ''}</p>
      <h1>{a.title}</h1>
      {a.subtitle ? <p className="lede">{a.subtitle}</p> : null}

      <dl className="facts">
        <div><dt>ZIP</dt><dd>ZIP {a.zip}</dd></div>
        <div><dt>Status</dt><dd>{a.zipStatus}</dd></div>
        <div><dt>Category</dt><dd>{a.zipCategory}</dd></div>
        <div><dt>Spec</dt><dd><a href={a.specUrl}>{a.specUrl.replace('https://', '')}</a></dd></div>
      </dl>

      <aside className="accountability" aria-label="Review, corrections and disclosure">
        <p><span className="label">Reviewed by</span>{a.reviewedBy}</p>
        <div>
          <span className="label">Corrections</span>
          {a.corrections.length ? <ul>{a.corrections.map((c) => <li key={c}>{c}</li>)}</ul> : <span>None yet.</span>}
        </div>
        <p><span className="label">Disclosure</span>{a.disclosure}</p>
      </aside>

      {a.outline.length > 1 ? (
        <nav className="outline" aria-label="Outline">
          <p className="label">Outline</p>
          <ol>{a.outline.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
        </nav>
      ) : null}

      <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />

      <footer className="article-foot">
        <p className="label">Licence</p>
        <p>This article is licensed CC BY 4.0. Found an error? Tell me on <a href="https://x.com/oxwizzdom">X</a> and it goes in the corrections log with your name, if you want it there.</p>
      </footer>
    </article>
  )
}
