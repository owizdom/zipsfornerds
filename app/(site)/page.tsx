import Link from 'next/link'
import HeroDiagram from '@/components/HeroDiagram'
import { getArticles } from '@/lib/content'
import { getZips } from '@/lib/zips'
import { site } from '@/lib/site'

const work = [
  ['01 / ONE_ZIP_PER_ARTICLE', 'One ZIP, start to finish', 'Every article opens with a plain-language summary, then covers the background, the mechanism, the case for the ZIP and the strongest case against it.'],
  ['02 / OWNER_REVIEW', 'Read by the people who wrote the ZIP', 'Each draft goes to the ZIP’s owners before it is published. The page says who reviewed it, or says plainly that nobody has yet.'],
  ['03 / PUBLIC_CORRECTIONS', 'Corrections at the top, with dates', 'ZIPs change after an explainer is written. When an article is fixed or updated, the change is logged where readers will see it.'],
  ['04 / PROTOCOL_ONLY', 'No price talk, no advocacy', 'If a ZIP has a serious objection on the record, the article carries it. Every article says how AI tools were used in making it.'],
]

export default function Home() {
  const articles = getArticles().slice(0, 3)
  const zips = getZips()
  const [lead, ...rest] = articles
  return (
    <>
      <section className="hero wrap">
        <div>
          <h1>Read the ZIP without reading the ZIP.</h1>
          <p className="lede">{site.description}</p>
        </div>
        <HeroDiagram />
      </section>

      <section className="wrap section" data-section="recent-publications">
        <div className="section-head">
          <h2>Recent publications</h2>
          <Link href="/research" className="btn">All research →</Link>
        </div>
        {!lead ? (
          <p className="empty">The first article, on ZIP 318 and the Orchard to Ironwood migration, is with reviewers. It will appear here once it has been checked.</p>
        ) : (
          <div className={rest.length ? 'bento' : 'bento solo'}>
            {[lead, ...rest].map((a, i) => (
              <Link key={a.slug} href={`/research/${a.slug}`} className={i === 0 ? 'card lead' : 'card'}>
                <div className="card-text">
                  <span className="tag">{a.tag || `ZIP ${a.zip}`}{a.status === 'draft' ? ' · preview' : ''}</span>
                  <h3><strong>ZIP {a.zip}:</strong> {a.title.replace(/^ZIP \d+:\s*/, '')}</h3>
                </div>
                {a.cover ? <img src={a.cover} alt="" /> : null}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="wrap section" data-section="scheduled-grid">
        <p className="label">Scheduled coverage</p>
        <div className="grid-cells">
          {zips.map((z) => {
            const inner = (<><span className="cell-zip">ZIP {z.zip}</span><span className="cell-title">{z.title}</span><span className="cell-status">{z.status} · {z.upgrade}</span></>)
            return z.articleSlug ? <Link key={z.zip} href={`/research/${z.articleSlug}`} className="cell">{inner}</Link> : <div key={z.zip} className="cell">{inner}</div>
          })}
        </div>
      </section>

      <section className="wrap section" data-section="how-we-work">
        <p className="label">How we work</p>
        <div className="work">
          {work.map(([tag, title, body]) => (
            <article key={tag}>
              <p className="label faint">{tag}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="after"><Link href="/method" className="btn">Read the method →</Link></p>
      </section>
    </>
  )
}
