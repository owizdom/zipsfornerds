'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  ['/research', 'Research'],
  ['/zips', 'ZIP index'],
  ['/method', 'Method'],
] as const

export default function Nav() {
  const pathname = usePathname() || '/'
  return (
    <nav aria-label="Main">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className={pathname.startsWith(href) ? 'active' : undefined}>{label}</Link>
      ))}
    </nav>
  )
}
