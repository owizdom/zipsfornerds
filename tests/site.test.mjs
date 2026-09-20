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
  for (const needle of ['ZIP 9999', 'Proposed', 'Reviewed by', 'Fixture Reviewer', 'Corrections', 'fixed a fixture typo', 'Disclosure', 'Fixture disclosure text', 'Sources']) {
    assert.ok(html.includes(needle), `article page missing "${needle}"`)
  }
})

test('AT4 zero third-party requests', () => {
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
  for (const key of ['title', 'series_number', 'subtitle', 'zip', 'zip_status', 'zip_category', 'spec_url', 'date', 'status', 'reviewed_by', 'disclosure', 'corrections', 'cover', 'tag', 'content']) {
    assert.match(cfg, new RegExp(`\\b${key}\\s*:`), `keystatic.config.ts has no field "${key}"`)
  }
  assert.match(cfg, /path:\s*'articles\/\*'/, 'articles collection must write to articles/')
  assert.match(cfg, /zips\/zips/, 'zips singleton must write to zips/zips.json')
  const manifest = fs.readFileSync(path.join(root, '.next', 'server', 'app-paths-manifest.json'), 'utf8')
  assert.match(manifest, /\/keystatic\//, 'admin UI route missing from the build')
  assert.match(manifest, /\/api\/keystatic\//, 'admin API route missing from the build')
})

test('AT15 the CMS is not an open door in production', async () => {
  const port = 4321
  const srv = spawn('npx', ['next', 'start', '-p', String(port)], { cwd: root, env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO: '' }, stdio: 'ignore' })
  try {
    let up = false
    for (let i = 0; i < 40 && !up; i++) {
      await new Promise((r) => setTimeout(r, 500))
      up = await fetch(`http://localhost:${port}/`).then((r) => r.ok).catch(() => false)
    }
    assert.ok(up, 'production server did not start')
    for (const p of ['/api/keystatic/tree', '/api/keystatic/blob/x/articles/zip-318-orchard-to-ironwood-migration.md']) {
      const r = await fetch(`http://localhost:${port}${p}`)
      assert.equal(r.status, 404, `${p} should be 404 in production without GitHub credentials, got ${r.status}`)
    }
    const admin = await fetch(`http://localhost:${port}/keystatic`)
    assert.equal(admin.status, 404, `/keystatic should be 404 in production without GitHub credentials, got ${admin.status}`)
  } finally {
    srv.kill('SIGTERM')
  }
})
