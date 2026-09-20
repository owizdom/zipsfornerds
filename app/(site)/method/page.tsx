import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Method',
  description: 'How ZIPs For Nerds articles are chosen, written, checked and corrected.',
  alternates: { canonical: '/method' },
}

const principles = [
  ['A spec is written for implementers. This is for everyone else.', 'Zcash Improvement Proposals decide block times, fees, issuance and what your wallet does during a migration. Coinholders now vote on some of those questions directly. The specs are public and written for the people who implement them, so most people affected by a ZIP never read it. Each article here takes one ZIP and explains it for readers who want more than a headline and less than the formal specification.'],
  ['Every article has the same shape.', 'A plain-language summary. The background. How the ZIP works, section by section. The case for it. The drawbacks, including the strongest argument against it that is on the record. Where things stand. The format is adapted, with permission, from EIPs For Nerds, the series created at Ethereum 2077.'],
  ['Claims are checked against the ZIP text.', 'Every number, quotation and mechanism is checked against the specification and the linked sources before publication, and again by a second independent pass. Sources are listed at the end of every article.'],
  ['Corrections are public.', 'ZIPs change after an explainer is written, and explainers contain mistakes. Corrections are logged at the top of the article with the date, and the ZIP index tracks each proposal’s current status.'],
  ['Protocol only.', 'No price commentary and no advocacy. The series is not affiliated with any Zcash organisation.'],
  ['AI use is disclosed.', 'Every article carries a disclosure line that says how AI tools were used in producing it.'],
  ['Free to reuse.', 'Articles are licensed CC BY 4.0. Wallet teams, educators and anyone else can copy, translate and adapt them with credit. The site sets no cookies and loads nothing from third parties.'],
]

export default function Method() {
  return (
    <section className="wrap page narrow">
      <p className="label">Core principles</p>
      <h1>How we work.</h1>
      <p className="lede">These are the rules every article follows. If you find one broken, send a correction and it goes in the log.</p>
      <ol className="principles">
        {principles.map(([title, body], i) => (
          <li key={title}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
