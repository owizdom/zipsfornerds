import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticle, getArticles, formatDate } from '@/lib/content'
import { site } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = getArticles().map((a) => ({ slug: a.slug }))
  // A dynamic route needs at least one param to prerender; the placeholder renders the 404 page.
  return slugs.length ? slugs : [{ slug: '_none' }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) return {}
  return {
    title: a.title,
    description: a.subtitle,
    alternates: { canonical: `/research/${a.slug}` },
    openGraph: { type: 'article', title: a.title, description: a.subtitle, url: `/research/${a.slug}`, publishedTime: a.date },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) notFound()
  const [head, tail] = a.title.includes(':') ? [a.title.slice(0, a.title.indexOf(':') + 1), a.title.slice(a.title.indexOf(':') + 1).trim()] : [a.title, '']
  return (
    <article className="article">
      <div className="wrap">
        <p className="back"><Link href="/research" className="btn">← All research</Link></p>
        <div className="cover-card" data-section="cover-card">
          <div className="cover-text">
            <span className="tag">{a.tag || `ZIP ${a.zip}`}{a.status === 'draft' ? ' · unpublished preview' : ''}</span>
            <h1><strong>{head}</strong>{tail ? <> {tail}</> : null}</h1>
          </div>
          {a.cover ? <img src={a.cover} alt="" /> : null}
        </div>
      </div>

      <div className="wrap column">
        <p className="label meta">ZIPs For Nerds #{a.seriesNumber} · {formatDate(a.date)} · {a.readingMinutes} min read</p>
        {a.subtitle ? <p className="lede">{a.subtitle}</p> : null}

        <dl className="facts">
          <div><dt>ZIP</dt><dd>ZIP {a.zip}</dd></div>
          <div><dt>Status</dt><dd>{a.zipStatus}</dd></div>
          <div><dt>Category</dt><dd>{a.zipCategory}</dd></div>
          <div><dt>Spec</dt><dd><a href={a.specUrl}>{a.specUrl.replace('https://', '')}</a></dd></div>
        </dl>
        <aside className="accountability" aria-label="Review, corrections and disclosure">
          <div>
            <span className="label">Corrections</span>
            {a.corrections.length ? <ul>{a.corrections.map((c) => <li key={c}>{c}</li>)}</ul> : <span>None yet.</span>}
          </div>
          <p><span className="label">Disclosure</span>{a.disclosure}</p>
        </aside>

        {a.outline.length > 1 ? (
          <nav className="outline" aria-label="Outline" data-section="outline">
            <p className="label">Outline</p>
            <ol>{a.outline.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
          </nav>
        ) : null}

        <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />

        <footer className="article-foot">
          <p className="label">Licence and corrections</p>
          <p>This article is licensed CC BY 4.0. Found an error? <a href={site.x}>Send a correction</a> and it goes in the log at the top of this page, with your name if you want it there.</p>
        </footer>
      </div>
    </article>
  )
}
