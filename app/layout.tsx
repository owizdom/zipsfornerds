import type { Metadata } from 'next'
import Link from 'next/link'
import { Source_Serif_4, IBM_Plex_Mono } from 'next/font/google'
import { site } from '@/lib/site'
import './globals.css'

const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: { siteName: site.name, type: 'website', url: site.url, title: site.name, description: site.description },
  twitter: { card: 'summary', creator: '@oxwizzdom' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="wrap bar">
            <Link href="/" className="wordmark" aria-label={`${site.name}, home`}>
              <span className="mark" aria-hidden="true" />
              ZIPs For Nerds
            </Link>
            <nav aria-label="Main">
              <Link href="/#articles">Articles</Link>
              <Link href="/zips/">ZIP index</Link>
              <Link href="/about/">About</Link>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="wrap cols">
            <div>
              <p className="wordmark small"><span className="mark" aria-hidden="true" />ZIPs For Nerds</p>
              <p className="muted">{site.tagline}</p>
            </div>
            <div>
              <p className="label">Navigate</p>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/zips/">ZIP index</Link></li>
                <li><Link href="/about/">About</Link></li>
                <li><a href="/rss.xml">RSS</a></li>
              </ul>
            </div>
            <div>
              <p className="label">Terms</p>
              <p className="muted">Articles are licensed CC BY 4.0. Reuse them, with credit. This site sets no cookies and loads nothing from third parties.</p>
            </div>
          </div>
          <div className="wrap fine">
            <span>© 2026 {site.author}</span>
            <span>Not affiliated with any Zcash organisation.</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
