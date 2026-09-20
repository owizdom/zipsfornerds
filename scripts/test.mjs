// Test gate: build the site from fixtures, run every test, and trip on zero tests or any skip (AT9).
// AT11 runs a second build into .next-dirty and AT15 starts a production server, so a full run takes a few minutes.
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd, args, env = {}) => spawnSync(cmd, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } })

const build = run('npx', ['next', 'build'], {
  ARTICLES_DIR: 'tests/fixtures/articles',
  ZIPS_FILE: 'tests/fixtures/zips.json',
  NODE_ENV: 'production',
})
if (build.status !== 0) {
  console.error(build.stdout + build.stderr)
  console.error('GATE FAILED: fixture build did not succeed')
  process.exit(1)
}

const t = run('node', ['--test', '--test-reporter=tap', 'tests/site.test.mjs', 'tests/content.test.mjs'])
const outText = t.stdout + t.stderr
console.log(outText)

const num = (label) => Number((outText.match(new RegExp(`^# ${label} (\\d+)`, 'm')) || [])[1] ?? NaN)
const tests = num('tests'), pass = num('pass'), fail = num('fail'), skipped = num('skipped'), todo = num('todo')
console.log(`SUMMARY tests=${tests} pass=${pass} fail=${fail} skipped=${skipped} todo=${todo}`)

if (!Number.isFinite(tests) || tests === 0) { console.error('GATE FAILED: zero tests ran'); process.exit(1) }
if (skipped > 0 || todo > 0) { console.error('GATE FAILED: skipped or todo tests are not allowed'); process.exit(1) }
if (fail > 0 || t.status !== 0) { console.error('GATE FAILED: failing tests'); process.exit(1) }
console.log('GATE PASSED')
