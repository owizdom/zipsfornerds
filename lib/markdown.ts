// Rehype plugins for the article pipeline.
//
// Both of these operate on the syntax tree, never on rendered HTML. That matters:
// rehype-stringify escapes `&` and `"` inside attribute values but leaves `<` alone,
// which is legal in an attribute and harmless there. Lifting such a value out of an
// attribute and splicing it into element content with a regex would turn it into live
// markup, so a figure caption could carry a <script> into every reader's page.
// Putting the caption in as a text node makes that impossible by construction.

type Node = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: Node[]
}

const isWhitespace = (n: Node) => n.type === 'text' && !String(n.value ?? '').trim()

/** A paragraph holding only an image with a title becomes a captioned figure. */
export function rehypeFigures() {
  return (tree: Node) => {
    const walk = (node: Node) => {
      if (!node.children) return
      node.children = node.children.map((child) => {
        walk(child)
        if (child.tagName !== 'p') return child
        const content = (child.children ?? []).filter((c) => !isWhitespace(c))
        const [only] = content
        if (content.length !== 1 || only.tagName !== 'img') return child
        const { title, ...rest } = (only.properties ?? {}) as Record<string, unknown>
        if (typeof title !== 'string' || !title) return child
        return {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            { type: 'element', tagName: 'img', properties: { ...rest, loading: 'lazy', decoding: 'async' }, children: [] },
            { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: title }] },
          ],
        }
      })
    }
    walk(tree)
  }
}

// Schemes that execute rather than navigate. `data:` is included because
// data:text/html renders as a document on the site's own origin in some browsers.
const UNSAFE_SCHEME = /^\s*(javascript|data|vbscript|file):/i

/** Strips link and image URLs that would execute instead of navigate. */
export function rehypeSafeUrls() {
  return (tree: Node) => {
    const walk = (node: Node) => {
      const props = node.properties
      if (props) {
        for (const key of ['href', 'src'] as const) {
          const value = props[key]
          if (typeof value === 'string' && UNSAFE_SCHEME.test(value)) {
            // Keep the visible text, drop the destination.
            delete props[key]
            props['data-unsafe-url-removed'] = 'true'
          }
        }
      }
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}
