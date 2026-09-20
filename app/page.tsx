import Link from 'next/link'
import { getArticles, formatDate } from '@/lib/content'
import { getZips } from '@/lib/zips'
import { site } from '@/lib/site'

const principles = [
  ['01 / ONE_ZIP_PER_ARTICLE', 'One ZIP, start to finish', 'Every article opens with a plain-language summary, then covers the background, the mechanism, the case for the ZIP and the strongest case against it.'],
  ['02 / OWNER_REVIEW', 'Read by the people who wrote the ZIP', 'Each draft goes to the ZIP’s owners before it is published. The page says who reviewed it, or says plainly that nobody has yet.'],
  ['03 / PUBLIC_CORRECTIONS', 'Corrections at the top, with dates', 'ZIPs change after an explainer is written. When an article is fixed or updated, the change is logged where readers will see it.'],
  ['04 / NO_PRICE_TALK', 'Protocol only', 'No price commentary and no advocacy. If a ZIP has a serious objection on the record, the article carries it.'],
]

export default function Home() {
  const articles = getArticles()
  const zips = getZips()
  return (
    <>
      <section className="hero wrap">
        <p className="label">A research series on Zcash Improvement Proposals</p>
        <h1>Read the ZIP <em>without</em> reading the ZIP.</h1>
        <p className="lede">{site.description}</p>
        <p className="hero-meta label">est. 2026 · {zips.length} ZIPs scheduled</p>
      </section>

      <section id="articles" className="wrap section">
        <div className="section-head">
          <h2>Articles</h2>
          <Link href="/zips/" className="label">Full ZIP index →</Link>
        </div>
        {articles.length === 0 ? (
          <p className="empty">The first article, on ZIP 318 and the Orchard to Ironwood migration, is with reviewers. It will appear here when it has been checked.</p>
        ) : (
          <ol className="article-list">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}/`}>
                  <span className="label">#{a.seriesNumber} · ZIP {a.zip} ({a.zipStatus} ZIP){a.status === 'draft' ? ' · UNPUBLISHED PREVIEW' : ''}</span>
                  <span className="title">{a.title}</span>
                  <span className="sub">{a.subtitle}</span>
                  <span className="label dim">{formatDate(a.date)} · {a.readingMinutes} min read</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="wrap section">
        <div className="section-head"><h2>How the series works</h2></div>
        <div className="principles">
          {principles.map(([tag, title, body]) => (
            <article key={tag}>
              <p className="label accent">{tag}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Scheduled coverage</h2>
          <Link href="/zips/" className="label">See statuses →</Link>
        </div>
        <ul className="chips">
          {zips.map((z) => (
            <li key={z.zip}>
              {z.articleSlug ? <Link href={`/articles/${z.articleSlug}/`}>ZIP {z.zip}</Link> : <span>ZIP {z.zip}</span>}
              <span className="chip-title">{z.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
