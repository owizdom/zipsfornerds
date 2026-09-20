import { notFound } from 'next/navigation'

// Unmatched URLs inside the site render the site's own 404 page.
export default function CatchAll() {
  notFound()
}
