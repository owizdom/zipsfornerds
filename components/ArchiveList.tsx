'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type ArchiveItem = { slug: string; title: string; subtitle: string; tag: string; date: string; dateLabel: string; zip: number; cover: string; draft: boolean }

export default function ArchiveList({ items }: { items: ArchiveItem[] }) {
  const tags = useMemo(() => [...new Set(items.map((i) => i.tag).filter(Boolean))], [items])
  const [tag, setTag] = useState('all')
  const [newest, setNewest] = useState(true)
  const shown = items
    .filter((i) => tag === 'all' || i.tag === tag)
    .sort((a, b) => (newest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
  return (
    <>
      <div className="chips-row">
        <div className="filters">
          {['all', ...tags].map((t) => (
            <button key={t} type="button" data-filter={t} className={t === tag ? 'chip on' : 'chip'} onClick={() => setTag(t)}>{t}</button>
          ))}
        </div>
        <button type="button" data-sort className="chip" onClick={() => setNewest(!newest)}>{newest ? '↓ Newest first' : '↑ Oldest first'}</button>
      </div>
      {shown.length === 0 ? (
        <p className="empty">The first article, on ZIP 318 and the Orchard to Ironwood migration, is with reviewers. It will appear here once it has been checked.</p>
      ) : (
        <ul className="archive">
          {shown.map((i) => (
            <li key={i.slug}>
              <Link href={`/research/${i.slug}`}>
                <div>
                  <p className="label"><span>{i.tag || 'ZIP'}</span> <em>{i.dateLabel}</em>{i.draft ? <span className="draft"> · unpublished preview</span> : null}</p>
                  <h2>{i.title}</h2>
                  <p className="sub">{i.subtitle}</p>
                </div>
                {i.cover ? <img className="thumb" src={i.cover} alt="" loading="lazy" /> : <span className="thumb" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
