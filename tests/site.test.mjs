// Acceptance tests for spec 0001. They run against out/, built from tests/fixtures by scripts/test.mjs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'out')
const read = (p) => fs.readFileSync(path.join(out, p), 'utf8')
const exists = (p) => fs.existsSync(path.join(out, p))

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}

const OWN_ORIGIN = 'https://zipsfornerds.com'
const isLocal = (u) =>
  u.startsWith('/') && !u.startsWith('//') ||
  u.startsWith('./') || u.startsWith('../') || u.startsWith('#') ||
  u.startsWith('data:') || u.startsWith(OWN_ORIGIN)

test('AT1 static routes exist', () => {
  for (const p of ['index.html', 'zips/index.html', 'about/index.html', 'rss.xml']) {
    assert.ok(exists(p), `missing out/${p}`)
  }
})

test('AT2 drafts never ship', () => {
  assert.ok(exists('articles/published-fixture/index.html'), 'published fixture has no route')
  assert.ok(!exists('articles/draft-fixture/index.html'), 'draft fixture got a route')
  const home = read('index.html')
  assert.ok(home.includes('A Fixture Proposal'), 'published fixture missing from home')
  const everything = walk(out).filter((f) => /\.(html|xml|txt|json|js)$/.test(f))
  for (const f of everything) {
    assert.ok(!fs.readFileSync(f, 'utf8').includes('DRAFT-FIXTURE-MARKER'), `draft content leaked into ${path.relative(out, f)}`)
  }
})

test('AT3 article page carries its accountability block', () => {
  const html = read('articles/published-fixture/index.html')
  for (const needle of ['ZIP 9999', 'Proposed', 'Reviewed by', 'Fixture Reviewer', 'Corrections', 'fixed a fixture typo', 'Disclosure', 'Fixture disclosure text', 'Sources']) {
    assert.ok(html.includes(needle), `article page missing "${needle}"`)
  }
})

test('AT4 zero third-party requests', () => {
  const offenders = []
  for (const f of walk(out)) {
    const rel = path.relative(out, f)
    if (/\.html$/.test(f)) {
      const html = fs.readFileSync(f, 'utf8')
      const tagAttr = /<(script|link|img|iframe|source|video|audio)\b[^>]*?\s(?:src|href)=["']([^"']+)["']/gi
      for (const m of html.matchAll(tagAttr)) if (!isLocal(m[2])) offenders.push(`${rel}: <${m[1]}> ${m[2]}`)
    }
    if (/\.(css|html)$/.test(f)) {
      const text = fs.readFileSync(f, 'utf8')
      for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) if (!isLocal(m[1])) offenders.push(`${rel}: url(${m[1]})`)
      for (const m of text.matchAll(/@import\s+["']([^"']+)["']/gi)) if (!isLocal(m[1])) offenders.push(`${rel}: @import ${m[1]}`)
    }
  }
  assert.deepEqual(offenders, [], 'third-party requests found')
})

test('AT8 RSS is well-formed and lists only published articles', () => {
  const xml = read('rss.xml')
  assert.ok(xml.startsWith('<?xml'), 'rss.xml has no XML declaration')
  assert.match(xml, /<channel>[\s\S]*<title>[^<]+<\/title>[\s\S]*<\/channel>/)
  const open = (xml.match(/<item>/g) || []).length
  const close = (xml.match(/<\/item>/g) || []).length
  assert.equal(open, close, 'unbalanced <item> tags')
  assert.equal(open, 1, 'fixture build should have exactly one published item')
  assert.ok(xml.includes('A Fixture Proposal'))
})
