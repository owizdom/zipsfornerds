// Content gates for spec 0001. They run on the REAL articles/ and zips/zips.json, not on fixtures.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { lintPublished } from '../lib/lint.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const articlesDir = path.join(root, 'articles')

const articles = fs.readdirSync(articlesDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), raw: fs.readFileSync(path.join(articlesDir, f), 'utf8') }))
  .map((a) => ({ ...a, fm: matter(a.raw).data }))

test('AT5 published content passes lint', () => {
  assert.ok(articles.length > 0, 'articles/ is empty, nothing was checked')
  for (const a of articles) {
    assert.ok(['draft', 'published'].includes(a.fm.status), `${a.slug}: status must be draft or published`)
    if (a.fm.status !== 'published') continue
    assert.deepEqual(lintPublished(a.raw), [], `${a.slug} is published with lint violations`)
  }
})

test('AT6 lint catches violations without blocking ordinary prose', () => {
  const bad = fs.readFileSync(path.join(root, 'tests/fixtures/bad-content.md'), 'utf8')
  const v = lintPublished(bad).join(' | ')
  assert.match(v, /em dash/i)
  assert.match(v, /en dash/i)
  assert.match(v, /placeholder/i)
  assert.match(v, /stanford/i)

  // Must be caught: dashes written as entities, other Unicode dashes, and
  // unfinished markers in any case, including inside something that looks like a citation.
  for (const [name, text] of [
    ['entity em dash', 'An em dash as an entity: &mdash; here.'],
    ['entity en dash', 'An en dash as an entity: &ndash; here.'],
    ['figure dash', 'A figure \u2012 dash.'],
    ['horizontal bar', 'A horizontal \u2015 bar.'],
    ['minus sign', 'A minus \u2212 sign.'],
    ['shouting placeholder', 'Disclosure: [YOUR CALL, MUST BE TRUE ON THE DAY YOU PUBLISH]'],
    ['placeholder inside a citation', 'See [ZIP 318: LINK] for details.'],
    ['lowercase tbd', 'Status is [tbd] right now.'],
    ['lowercase link', 'Read it at [link] please.'],
  ]) {
    assert.ok(lintPublished(text).length > 0, `lint missed ${name}: ${text}`)
  }

  // Must NOT be caught: a series about ZIPs is full of bracketed identifiers and links.
  for (const [name, text] of [
    ['spec identifiers', 'Prose citing [ZIP 226], [BIP 340], [RFC 8032], [NU6.3] and [CVE-2026-34202].'],
    ['inline link', 'A [normal link](https://zips.z.cash/) in a sentence.'],
    ['reference link', 'A [reference link][1] in a sentence.'],
    ['empty array', 'corrections: []'],
    ['plain prose', 'ZIP 318 says the canonical fee is 15,000 zatoshis.'],
  ]) {
    assert.deepEqual(lintPublished(text), [], `lint false-positived on ${name}: ${text}`)
  }
})

test('AT7 ZIP index is consistent', () => {
  const zips = JSON.parse(fs.readFileSync(path.join(root, 'zips/zips.json'), 'utf8')).entries
  assert.ok(zips.length >= 11, 'expected the scheduled coverage list')
  const published = new Set(articles.filter((a) => a.fm.status === 'published').map((a) => a.slug))
  for (const z of zips) {
    assert.equal(typeof z.zip, 'number')
    for (const k of ['title', 'status', 'upgrade', 'specUrl']) assert.ok(z[k], `ZIP ${z.zip} missing ${k}`)
    assert.match(z.specUrl, /^https:\/\/zips\.z\.cash\//, `ZIP ${z.zip} specUrl`)
    if (z.articleSlug) assert.ok(published.has(z.articleSlug), `ZIP ${z.zip} links to unpublished or missing article "${z.articleSlug}"`)
  }
})
