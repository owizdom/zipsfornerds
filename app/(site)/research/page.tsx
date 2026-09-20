import type { Metadata } from 'next'
import Link from 'next/link'
import ArchiveList from '@/components/ArchiveList'
import { getArticles, formatDate } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Research',
  description: 'Every ZIPs For Nerds explainer, newest first.',
  alternates: { canonical: '/research' },
}

export default function Research() {
  const items = getArticles().map((a) => ({
    slug: a.slug, title: a.title, subtitle: a.subtitle, tag: a.tag, date: a.date, dateLabel: formatDate(a.date), zip: a.zip, cover: a.cover, draft: a.status === 'draft',
  }))
  return (
    <section className="wrap page narrow">
      <div className="page-top">
        <p className="label">Research archive</p>
        <Link href="/" className="btn">← Back</Link>
      </div>
      <h1>Explainers</h1>
      <ArchiveList items={items} />
    </section>
  )
}
