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

test('AT6 lint catches violations', () => {
  const bad = fs.readFileSync(path.join(root, 'tests/fixtures/bad-content.md'), 'utf8')
  const v = lintPublished(bad).join(' | ')
  assert.match(v, /em dash/i)
  assert.match(v, /en dash/i)
  assert.match(v, /placeholder/i)
  assert.match(v, /stanford/i)
  assert.deepEqual(lintPublished('Plain text with a [normal link](https://zips.z.cash/) and nothing else.'), [])
})

test('AT7 ZIP index is consistent', () => {
  const zips = JSON.parse(fs.readFileSync(path.join(root, 'zips/zips.json'), 'utf8'))
  assert.ok(zips.length >= 11, 'expected the scheduled coverage list')
  const published = new Set(articles.filter((a) => a.fm.status === 'published').map((a) => a.slug))
  for (const z of zips) {
    assert.equal(typeof z.zip, 'number')
    for (const k of ['title', 'status', 'upgrade', 'specUrl']) assert.ok(z[k], `ZIP ${z.zip} missing ${k}`)
    assert.match(z.specUrl, /^https:\/\/zips\.z\.cash\//, `ZIP ${z.zip} specUrl`)
    if (z.articleSlug) assert.ok(published.has(z.articleSlug), `ZIP ${z.zip} links to unpublished or missing article "${z.articleSlug}"`)
  }
})
