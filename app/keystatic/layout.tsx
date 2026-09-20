import { notFound } from 'next/navigation'
import { cmsEnabled } from '@/lib/cms'
import KeystaticApp from './keystatic'

export const metadata = { title: 'ZIPs For Nerds CMS', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default function Layout() {
  if (!cmsEnabled) notFound()
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  )
}
