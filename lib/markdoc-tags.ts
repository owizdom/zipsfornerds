// Keystatic's editor writes custom blocks as Markdoc tags. The article pipeline is
// remark-based, so tags are normalised into plain markdown before parsing. Doing it
// here means the CMS gets a proper caption field while the renderer keeps one code
// path for figures, already covered by the AT10 and AT17 tests.

const attrs = (raw: string) => {
  const out: Record<string, string> = {}
  for (const m of raw.matchAll(/(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"/g)) {
    out[m[1]] = m[2].replace(/\\"/g, '"')
  }
  return out
}

/** Escapes the characters that would break out of a markdown image. */
const safe = (s: string) => (s || '').replace(/[[\]()"\n]/g, (c) => (c === '\n' ? ' ' : '\\' + c))

/**
 * Rewrites `{% figure src="…" alt="…" caption="…" /%}` into the captioned-image
 * markdown the rest of the pipeline already understands.
 */
export function normaliseMarkdocTags(markdown: string): string {
  return markdown.replace(/\{%\s*figure\s+([^%]*?)\/?%\}/g, (_full, raw: string) => {
    const a = attrs(raw)
    if (!a.src) return ''
    return `![${safe(a.alt)}](${a.src}${a.caption ? ` "${safe(a.caption)}"` : ''})`
  })
}
