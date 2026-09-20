import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description: 'What ZIPs For Nerds is, how articles are checked, and who writes them.',
  alternates: { canonical: '/about/' },
}

export default function About() {
  return (
    <section className="wrap page narrow">
      <p className="label">About</p>
      <h1>A spec is written for the people who implement it. This is for everyone else.</h1>

      <div className="prose">
        <p>Zcash Improvement Proposals decide how the protocol changes: block times, fees, issuance, what your wallet does during a migration. Coinholders now vote on some of those questions directly. The specs are public, and they are written for implementers, so most people who are affected by a ZIP never read it.</p>
        <p>ZIPs For Nerds takes one ZIP per article and explains it for readers who want more than a headline and less than the formal specification.</p>

        <h2 id="format">The format</h2>
        <p>The format is adapted, with his blessing, from <a href="https://hackmd.io/@emmanuel-awosika/Introducing-EIPs-For-Nerds">EIPs For Nerds</a>, the series Emmanuel Awosika created at Ethereum 2077. Every article follows the same order: a plain-language summary, the background, how the ZIP works, the case for it, the drawbacks, and where things stand.</p>

        <h2 id="method">How articles are checked</h2>
        <ul>
          <li>Every technical claim is checked against the ZIP text and the linked sources before publication.</li>
          <li>Each draft is sent to the ZIP’s owners. The article says who reviewed it. If nobody has, it says that.</li>
          <li>Corrections are logged at the top of the article with the date.</li>
          <li>Every article includes the strongest argument against the ZIP it covers. There is no price commentary.</li>
          <li>Every article carries a disclosure line that says how AI tools were used in producing it.</li>
        </ul>

        <h2 id="reuse">Reuse</h2>
        <p>Articles are licensed CC BY 4.0. Wallet teams, ZecHub, educators and anyone else can copy, translate and adapt them with credit.</p>

        <h2 id="author">Who writes it</h2>
        <p>I am <a href={site.authorUrl}>Wisdom Okechukwu</a>, a research engineer based in Kigali, Rwanda, and a Research Fellow at Free Systems Lab. Before this I wrote protocol research at 2077 Research, Shoal Research and Parallel Research. I am a named author on <a href="https://arxiv.org/abs/2609.09582">ECDSA.Fail</a>, a paper on the cost of the quantum attack on elliptic-curve cryptography.</p>
        <p>I am not affiliated with any Zcash organisation. If you own a ZIP and want to review a draft, or you have found an error, reach me on <a href={site.x}>X</a>.</p>
      </div>
    </section>
  )
}
