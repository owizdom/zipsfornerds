// Gate for published articles. Dependency-free so the test runner can import it directly.
// A published article must not contain dashes used as punctuation, the word "Stanford",
// or an unresolved ALL-CAPS bracket placeholder such as [LINK] or [REFRESH ON PUBLICATION DAY].

const PLACEHOLDER = /\[[A-Z][A-Z0-9 ,.'’:;!?#-]{2,}[^\]]*\](?!\()/g

export function lintPublished(markdown: string): string[] {
  const violations: string[] = []
  const lines = markdown.split('\n')
  lines.forEach((line, i) => {
    const at = `line ${i + 1}`
    if (line.includes('—')) violations.push(`${at}: em dash`)
    if (line.includes('–')) violations.push(`${at}: en dash`)
    if (/stanford/i.test(line)) violations.push(`${at}: mentions Stanford`)
    for (const m of line.matchAll(PLACEHOLDER)) violations.push(`${at}: unresolved placeholder ${m[0].slice(0, 40)}`)
  })
  return violations
}
