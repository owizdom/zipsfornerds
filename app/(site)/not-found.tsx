import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="wrap page narrow">
      <p className="label">404</p>
      <h1>No ZIP at this address.</h1>
      <p className="lede">The page you asked for does not exist, or the article has not been published yet.</p>
      <p><Link href="/" className="btn">← Back to the front page</Link></p>
    </section>
  )
}
