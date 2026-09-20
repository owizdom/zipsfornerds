// Gate for published articles. Dependency-free so the test runner can import it directly.
//
// A published article must not contain dashes used as punctuation, a banned affiliation,
// or an unresolved authoring placeholder such as [LINK] or [REFRESH ON PUBLICATION DAY].
//
// Two ways this can go wrong, both of which have bitten us:
//   - too loose: an em dash written as the entity &mdash; renders as a real em dash but
//     reads as plain ASCII in the source, so a literal-character check never sees it;
//   - too strict: a series about ZIPs is full of bracketed identifiers like [ZIP 226] and
//     [BIP 340]. Flagging those would fail the production build on ordinary prose.

/** Dash characters and the entities that render as them. */
const DASHES: [RegExp, string][] = [
  [/—/, 'em dash'],
  [/–/, 'en dash'],
  [/‒/, 'figure dash'],
  [/―/, 'horizontal bar'],
  [/−/, 'minus sign'],
  [/&mdash;|&#8212;|&#x2014;/i, 'em dash written as an entity'],
  [/&ndash;|&#8211;|&#x2013;/i, 'en dash written as an entity'],
]

/** Bracketed spec identifiers that are legitimate prose, not placeholders. */
const IDENTIFIER = /^(ZIP|BIP|EIP|ERC|RFC|NU|CVE|GHSA)[\s-]?[\d.]/i

/** Words that mean "unfinished" wherever they appear in brackets, in any case. */
const UNFINISHED = /\b(TBD|TODO|FIXME|XXX|YOUR CALL|REFRESH|PLACEHOLDER|DOMAIN|LINK|VIEWS AND REPLIES|MONTH \d{4})\b/i

/**
 * A bracketed run that is not a markdown link. The negative lookahead rejects
 * inline links `[text](url)` and reference links `[text][1]`.
 */
const BRACKETED = /\[([^\]\n]{2,})\](?![([])/g

export function lintPublished(markdown: string): string[] {
  const violations: string[] = []
  markdown.split('\n').forEach((line, i) => {
    const at = `line ${i + 1}`

    for (const [pattern, name] of DASHES) {
      if (pattern.test(line)) violations.push(`${at}: ${name}`)
    }

    if (/stanford/i.test(line)) violations.push(`${at}: mentions Stanford`)

    for (const m of line.matchAll(BRACKETED)) {
      const inner = m[1].trim()
      // An unfinished marker always counts, even inside something that looks like
      // an identifier: [ZIP 318: LINK] is a placeholder, not a citation.
      const unfinished = UNFINISHED.test(inner)
      if (!unfinished && IDENTIFIER.test(inner)) continue
      const shouting = inner === inner.toUpperCase() && /[A-Z]{2}/.test(inner)
      if (shouting || unfinished) {
        violations.push(`${at}: unresolved placeholder ${m[0].slice(0, 40)}`)
      }
    }
  })
  return violations
}
