import type { Metadata } from 'next'
import Link from 'next/link'
import { getZips } from '@/lib/zips'

export const metadata: Metadata = {
  title: 'ZIP index',
  description: 'Every ZIP the series plans to cover, with its current status, target upgrade and a link to the explainer once one is published.',
  alternates: { canonical: '/zips' },
}

export default function ZipIndex() {
  const zips = getZips()
  return (
    <section className="wrap page narrow">
      <p className="label">Coverage</p>
      <h1>ZIP index.</h1>
      <p className="lede">Every ZIP the series plans to cover. Statuses are copied from zips.z.cash and updated when a ZIP moves. If a ZIP is dropped from an upgrade, it is replaced here and the change is noted.</p>
      <div className="table-scroll">
        <table className="zip-table">
          <thead><tr><th>ZIP</th><th>Title</th><th>Status</th><th>Upgrade</th><th>Explainer</th></tr></thead>
          <tbody>
            {zips.map((z) => (
              <tr key={z.zip}>
                <td className="mono"><a href={z.specUrl}>{z.zip}</a></td>
                <td>{z.title}</td>
                <td><span className={`pill s-${z.status.toLowerCase().replace(/[^a-z]/g, '')}`}>{z.status}</span></td>
                <td className="mono">{z.upgrade}</td>
                <td>{z.articleSlug ? <Link href={`/research/${z.articleSlug}`}>Read →</Link> : <span className="muted">Scheduled</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">One more slot is reserved for a ZIP chosen by a poll on the Zcash Community Forum.</p>
    </section>
  )
}
