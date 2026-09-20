import type { Metadata } from 'next'
import Link from 'next/link'
import { Source_Serif_4, IBM_Plex_Mono, Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Nav from '@/components/Nav'
import PrivacyLine from '@/components/PrivacyLine'
import Progress from '@/components/Progress'
import { site } from '@/lib/site'
import { analyticsEnabled, gaId } from '@/lib/analytics'
import '../globals.css'

const serif = Source_Serif_4({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })
const sans = Inter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: { siteName: site.name, type: 'website', url: site.url, title: site.name, description: site.description },
  twitter: { card: 'summary' },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body className="site">
        <a className="skip" href="#main">Skip to content</a>
        <Progress />
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label={`${site.name}, home`}>
            <span className="mark" aria-hidden="true" />
            <em>ZIPs For Nerds</em>
          </Link>
          <Nav />
        </header>
        <main id="main" className="fade-in">{children}</main>
        <footer className="site-footer">
          <div className="wrap cols">
            <div>
              <p className="wordmark"><span className="mark" aria-hidden="true" /><em>ZIPs For Nerds</em></p>
              <p className="blurb">{site.blurb}</p>
            </div>
            <div>
              <p className="label">Navigate</p>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/research">Research</Link></li>
                <li><Link href="/zips">ZIP index</Link></li>
                <li><Link href="/method">Method</Link></li>
              </ul>
            </div>
            <div>
              <p className="label">Contact</p>
              <ul>
                <li><a href={site.x}>Send a correction →</a></li>
                <li><a href="/rss.xml">RSS feed</a></li>
              </ul>
              <PrivacyLine />
            </div>
          </div>
          <div className="wrap fine">
            <span>© 2026 ZIPs For Nerds</span>
            <em>{site.tagline}</em>
          </div>
        </footer>
        {analyticsEnabled ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
