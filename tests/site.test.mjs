// Acceptance tests for specs 0001 and 0002. They run against the prerendered output in .next/,
// built from tests/fixtures by scripts/test.mjs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = path.join(root, '.next', 'server', 'app')
const read = (p) => fs.readFileSync(path.join(app, p), 'utf8')
const exists = (p) => fs.existsSync(path.join(app, p))

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}
const pages = () => walk(app).filter((f) => /\.(html|body)$/.test(f))

const OWN_ORIGIN = 'https://zipsfornerds.com'
const isLocal = (u) =>
  (u.startsWith('/') && !u.startsWith('//')) ||
  u.startsWith('./') || u.startsWith('../') || u.startsWith('#') ||
  u.startsWith('data:') || u.startsWith(OWN_ORIGIN)

test('AT1 routes exist, old routes are gone', () => {
  for (const p of ['index.html', 'research.html', 'zips.html', 'method.html', 'rss.xml.body']) assert.ok(exists(p), `missing ${p}`)
  for (const p of ['about.html', 'articles']) assert.ok(!exists(p), `${p} should be gone`)
})

test('AT2 drafts never ship', () => {
  assert.ok(exists('research/published-fixture.html'), 'published fixture has no page')
  assert.ok(!exists('research/draft-fixture.html'), 'draft fixture got a page')
  assert.ok(read('index.html').includes('A Fixture Proposal'), 'published fixture missing from home')
  assert.ok(read('research.html').includes('A Fixture Proposal'), 'published fixture missing from the archive')
  const everything = walk(path.join(root, '.next', 'server')).concat(walk(path.join(root, '.next', 'static')))
    .filter((f) => /\.(html|body|rsc|txt|json|js)$/.test(f))
  for (const f of everything) {
    assert.ok(!fs.readFileSync(f, 'utf8').includes('DRAFT-FIXTURE-MARKER'), `draft content leaked into ${path.relative(root, f)}`)
  }
})

test('AT3 article page carries its accountability block', () => {
  const html = read('research/published-fixture.html')
  for (const needle of ['ZIP 9999', 'Proposed', 'Corrections', 'fixed a fixture typo', 'Disclosure', 'Fixture disclosure text', 'Sources']) {
    assert.ok(html.includes(needle), `article page missing "${needle}"`)
  }
})

test('AT4 zero third-party requests (analytics off, the default)', () => {
  assert.ok(!read('index.html').includes('googletagmanager'), 'the fixture build must be free of analytics')
  const offenders = []
  const cssFiles = walk(path.join(root, '.next', 'static')).filter((f) => f.endsWith('.css'))
  for (const f of pages().concat(cssFiles)) {
    const rel = path.relative(root, f)
    const text = fs.readFileSync(f, 'utf8')
    if (!f.endsWith('.css')) {
      const tagAttr = /<(script|link|img|iframe|source|video|audio)\b[^>]*?\s(?:src|href)=["']([^"']+)["']/gi
      for (const m of text.matchAll(tagAttr)) if (!isLocal(m[2])) offenders.push(`${rel}: <${m[1]}> ${m[2]}`)
    }
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) if (!isLocal(m[1])) offenders.push(`${rel}: url(${m[1]})`)
    for (const m of text.matchAll(/@import\s+["']([^"']+)["']/gi)) if (!isLocal(m[1])) offenders.push(`${rel}: @import ${m[1]}`)
  }
  assert.deepEqual(offenders, [], 'third-party requests found')
})

test('AT8 RSS is well-formed and lists only published articles', () => {
  const xml = read('rss.xml.body')
  assert.ok(xml.startsWith('<?xml'), 'rss.xml has no XML declaration')
  assert.match(xml, /<channel>[\s\S]*<title>[^<]+<\/title>[\s\S]*<\/channel>/)
  const open = (xml.match(/<item>/g) || []).length
  assert.equal(open, (xml.match(/<\/item>/g) || []).length, 'unbalanced <item> tags')
  assert.equal(open, 1, 'fixture build should have exactly one published item')
  assert.ok(xml.includes('/research/published-fixture'), 'RSS should link to the /research/ route')
})

test('AT10 figures render with captions and every local image exists', () => {
  const html = read('research/published-fixture.html')
  assert.match(html, /<figure><img[^>]+fig-2-turnstile\.svg[^>]*><figcaption>Fixture caption text\.<\/figcaption><\/figure>/)
  let checked = 0
  for (const f of pages()) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/<img\b[^>]*?\ssrc=["'](\/[^"']+)["']/gi)) {
      checked++
      assert.ok(fs.existsSync(path.join(root, 'public', m[1])), `${path.relative(root, f)} references missing image ${m[1]}`)
    }
  }
  assert.ok(checked > 0, 'no images were checked')
})

test('AT11 the build refuses a dirty published article', () => {
  const r = spawnSync('npx', ['next', 'build'], {
    cwd: root, encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', ARTICLES_DIR: 'tests/fixtures/dirty', ZIPS_FILE: 'tests/fixtures/zips.json', NEXT_DIST_DIR: '.next-dirty' },
  })
  assert.notEqual(r.status, 0, 'a build with a dirty published article must fail')
  assert.match(r.stdout + r.stderr, /dirty-published/, 'the failure should name the offending file')
})

test('AT12 no personal name anywhere on the site', () => {
  const needles = [/wisdom/i, /okechukwu/i]
  const sources = ['app', 'components', 'lib'].flatMap((d) => walk(path.join(root, d))).filter((f) => /\.(tsx?|css|svg|json)$/.test(f))
  for (const f of pages().concat(sources)) {
    const text = fs.readFileSync(f, 'utf8')
    for (const n of needles) assert.ok(!n.test(text), `${path.relative(root, f)} contains ${n}`)
  }
})

test('AT13 the schema-style structure is present', () => {
  const home = read('index.html')
  for (const id of ['hero-diagram', 'recent-publications', 'scheduled-grid', 'how-we-work']) assert.ok(home.includes(`data-section="${id}"`), `home is missing ${id}`)
  const archive = read('research.html')
  assert.ok(archive.includes('data-filter='), 'archive has no filter chips')
  assert.ok(archive.includes('data-sort'), 'archive has no sort control')
  const article = read('research/published-fixture.html')
  assert.ok(article.includes('data-section="cover-card"'), 'article has no cover card')
  assert.ok(article.includes('data-section="outline"'), 'article has no outline')
})

test('AT14 the CMS is wired', () => {
  const cfg = fs.readFileSync(path.join(root, 'keystatic.config.ts'), 'utf8')
  for (const key of ['title', 'series_number', 'subtitle', 'zip', 'zip_status', 'zip_category', 'spec_url', 'date', 'status', 'disclosure', 'corrections', 'cover', 'tag', 'content']) {
    assert.match(cfg, new RegExp(`\\b${key}\\s*:`), `keystatic.config.ts has no field "${key}"`)
  }
  assert.match(cfg, /path:\s*'articles\/\*'/, 'articles collection must write to articles/')
  assert.match(cfg, /zips\/zips/, 'zips singleton must write to zips/zips.json')
  const manifest = fs.readFileSync(path.join(root, '.next', 'server', 'app-paths-manifest.json'), 'utf8')
  assert.match(manifest, /\/keystatic\//, 'admin UI route missing from the build')
  assert.match(manifest, /\/api\/keystatic\//, 'admin API route missing from the build')
})

test('AT15 the CMS is not an open door in production', async () => {
  // This build was made with the CMS switched off (see scripts/test.mjs). Because
  // NEXT_PUBLIC_ values are inlined at build time, that is the state under test:
  // a deployment built without GitHub credentials must expose nothing.
  const port = 4321
  const srv = spawn('npx', ['next', 'start', '-p', String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO: '' },
    stdio: 'ignore',
  })
  try {
    let up = false
    for (let i = 0; i < 40 && !up; i++) {
      await new Promise((r) => setTimeout(r, 500))
      up = await fetch(`http://localhost:${port}/`).then((r) => r.ok).catch(() => false)
    }
    assert.ok(up, 'production server did not start')
    for (const p of [
      '/keystatic',
      '/keystatic/collection/articles',
      '/api/keystatic/tree',
      '/api/keystatic/blob/main/articles/zip-318-orchard-to-ironwood-migration.md',
    ]) {
      const r = await fetch(`http://localhost:${port}${p}`)
      assert.equal(r.status, 404, `${p} should be 404 when the CMS is not configured, got ${r.status}`)
    }
  } finally {
    srv.kill('SIGTERM')
  }
})

test('AT16 the privacy claim always matches reality', () => {
  // Analytics off (the fixture build): claim "no trackers" and load none.
  const off = read('index.html')
  assert.match(off, /data-privacy="none"/, 'footer should be in the no-analytics state')
  assert.ok(off.includes('no cookies · no trackers'), 'footer should claim no trackers')
  assert.ok(!off.includes('googletagmanager'), 'no analytics script when analytics is off')

  // Analytics on: the claim must change with it.
  const dist = '.next-ga'
  const r = spawnSync('npx', ['next', 'build'], {
    cwd: root, encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', ARTICLES_DIR: 'tests/fixtures/articles', ZIPS_FILE: 'tests/fixtures/zips.json', NEXT_DIST_DIR: dist, NEXT_PUBLIC_GA_ID: 'G-TESTONLY123' },
  })
  assert.equal(r.status, 0, `analytics build failed:\n${r.stdout}${r.stderr}`)
  const on = fs.readFileSync(path.join(root, dist, 'server', 'app', 'index.html'), 'utf8')
  assert.match(on, /data-privacy="analytics"/, 'footer should be in the analytics state')
  assert.ok(!on.includes('no cookies · no trackers'), 'the site must not claim "no trackers" while running one')
  assert.ok(on.includes('Google Analytics'), 'footer should name the analytics provider')
  assert.ok(on.includes('G-TESTONLY123'), 'the measurement id should reach the page')
})

test('AT17 hostile article content cannot inject script or executable URLs', () => {
  const dist = '.next-xss'
  const r = spawnSync('npx', ['next', 'build'], {
    cwd: root, encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', ARTICLES_DIR: 'tests/fixtures/xss', ZIPS_FILE: 'tests/fixtures/zips.json', NEXT_DIST_DIR: dist },
  })
  assert.equal(r.status, 0, `hostile fixture should build:\n${r.stdout}${r.stderr}`)
  const html = fs.readFileSync(path.join(root, dist, 'server', 'app', 'research', 'evil.html'), 'utf8')

  // No injected markup may reach the page as markup. Each of these is the exact
  // string the fixture tries to smuggle in through a different vector.
  for (const literal of [
    '<script>window.PWNED=1</script>',   // caption breaking out of its attribute
    '<script>window.RAWPWN=1</script>',  // raw HTML in the body
    'onerror="window.IMGPWN=1"',         // inline event handler
  ]) {
    assert.ok(!html.includes(literal), `injection survived: ${literal}`)
  }
  assert.ok(!/href="\s*javascript:/i.test(html), 'a javascript: URL survived')
  assert.ok(!/href="\s*data:text\/html/i.test(html), 'a data:text/html URL survived')

  // The caption still renders, as inert escaped text.
  assert.match(html, /<figcaption>Cap&#x3C;\/figcaption>/, 'caption should render as escaped text')

  // Alt text keeps its raw characters, which is safe: inside a quoted attribute
  // value an HTML parser treats `<` as literal text, so it cannot open a tag.
  assert.match(html, /alt="a<script>window\.ALTPWN=1<\/script>b"/, 'alt should stay inside its attribute')
})

test('AT18 a production build ignores SHOW_DRAFTS', () => {
  const dist = '.next-drafts'
  const r = spawnSync('npx', ['next', 'build'], {
    cwd: root, encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', SHOW_DRAFTS: '1', ARTICLES_DIR: 'tests/fixtures/articles', ZIPS_FILE: 'tests/fixtures/zips.json', NEXT_DIST_DIR: dist },
  })
  assert.equal(r.status, 0, `build failed:\n${r.stdout}${r.stderr}`)
  const dir = path.join(root, dist, 'server', 'app')
  assert.ok(!fs.existsSync(path.join(dir, 'research', 'draft-fixture.html')), 'SHOW_DRAFTS=1 published a draft route in production')

  // The draft's own words and its link must appear nowhere. (Its title is not a
  // useful probe: the ZIP index fixture legitimately carries the same string.)
  for (const f of walk(path.join(root, dist, 'server')).concat(walk(path.join(root, dist, 'static')))
    .filter((p) => /\.(html|body|rsc|json|js)$/.test(p))) {
    const text = fs.readFileSync(f, 'utf8')
    assert.ok(!text.includes('DRAFT-FIXTURE-MARKER'), `draft content leaked into ${path.relative(root, f)}`)
    assert.ok(!text.includes('/research/draft-fixture'), `draft link leaked into ${path.relative(root, f)}`)
  }
  const rss = fs.readFileSync(path.join(dir, 'rss.xml.body'), 'utf8')
  assert.equal((rss.match(/<item>/g) || []).length, 1, 'RSS should still carry only the published fixture')
})

test('AT19 the site makes no owner-review promise', () => {
  const banned = [/reviewed by/i, /owner_review/i, /owners before it is published/i, /owners see it first/i, /wrote the ZIP/i]
  const sources = ['app', 'components', 'lib'].flatMap((d) => walk(path.join(root, d))).filter((f) => /\.(tsx?|css)$/.test(f))
  for (const f of pages().concat(sources)) {
    const text = fs.readFileSync(f, 'utf8')
    for (const b of banned) assert.ok(!b.test(text), `${path.relative(root, f)} still promises owner review (${b})`)
  }
})

test('AT20 the CMS offers a captioned figure block that the renderer understands', () => {
  const cfg = fs.readFileSync(path.join(root, 'keystatic.config.ts'), 'utf8')
  assert.match(cfg, /content-components/, 'figure block should come from @keystatic/core/content-components')
  assert.match(cfg, /components:\s*\{\s*figure\s*\}/, 'the markdoc field should register the figure block')
  for (const k of ['src', 'alt', 'caption']) {
    assert.match(cfg, new RegExp(`\\b${k}:`), `figure block is missing the "${k}" field`)
  }
  // A published fixture written with the Markdoc tag must render as a real figure.
  const html = read('research/published-fixture.html')
  assert.match(html, /<figure><img[^>]+tag-fixture\.svg[^>]*><figcaption>Written as a Markdoc tag\.<\/figcaption><\/figure>/,
    'a {% figure %} tag should render as a captioned figure')
})
