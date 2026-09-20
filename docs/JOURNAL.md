# JOURNAL

## Snapshot (20 Sep 2026)

- Repo: owizdom/zipsfornerds, PRIVATE. Branch `agent/site-v1`. Domain zipsfornerds.com registered at Namecheap 20 Sep 2026 (whois creation 05:32:50Z). Nothing deployed.
- Site v1 (spec 0001) built. Gate: 9 tests, 9 pass, 0 skipped, green 3 runs in a row.
- Article #1 (ZIP 318) is `status: draft`: excluded from production builds. Fact-check pass 1 (fresh-context agent, Fable 5.1) found 3 errors, 22 imprecise items, 5 unsupported claims; all applied in the rewrite. Pass 2 on the rewrite is pending.
- Open before publishing article #1: pass 2 results, Wisdom reads and edits it, disclosure line filled in truthfully, CipherScan numbers refreshed, draft sent to the ZIP's owners.
- Open before deploying: Wisdom's explicit OK, Vercel project, DNS at Namecheap.

## Snapshot addendum (20 Sep 2026, later)

- Branch `agent/site-v2` stacks on `agent/site-v1` (draft PR #1). Layout remodelled on schemaresearch.xyz after studying it in the browser; palette kept; Wisdom's name removed everywhere (AT12 guards it).
- CMS: Keystatic, chosen by Wisdom over Payload. Works at /keystatic in dev (local mode). Production CMS is 404 until GitHub mode is configured (AT15).
- `output: 'export'` and `trailingSlash` are gone: Keystatic needs route handlers and its router breaks on trailing slashes. Pages are still statically prerendered.
- Dev server moved to port 3001 because Chrome had cached 308 redirects for localhost:3000 from the trailing-slash era.
- Article #1: pass 2 found every number and quotation correct, 2 errors and about 24 imprecise or unsupported items; all 34 edits applied. Still a draft.

## Evidence log (append-only)

- 2026-09-20. Spec committed before tests (878bbf3). Failing tests committed before implementation (adcc87c); recorded failure: "GATE FAILED: fixture build did not succeed" (no app directory yet).
- 2026-09-20. First green run after implementation: tests=8 pass=8. After adding AT10 (figures): tests=9 pass=9, three consecutive runs.
- 2026-09-20. Real production build (no fixtures): routes /, /about, /zips, /rss.xml, /articles/_none (404 placeholder). rss.xml has 0 items. No zip-318 route. Home shows the "with reviewers" notice.
- 2026-09-20. ZIP list corrected against the ZIP pages themselves: ZIP 230 is Withdrawn (live v6 format is ZIP 229); ZIP 2006 is Reserved with no text (replaced by ZIP 258). The zips.z.cash NU7 candidate list still names ZIP 230.
- 2026-09-20. Models: architect, tests, implementation and article draft by Claude Fable 5.1 in one session. Fact-check pass 1 by a separate fresh-context Fable 5.1 agent.
- 2026-09-20. v2 spec committed 9cbf45e, failing tests f17c472 (recorded: "GATE FAILED: fixture build did not succeed"), implementation 09090a6. Gate after implementation: tests=14 pass=14, three consecutive runs.
- 2026-09-20. CMS round-trip check in Chrome: opened article #1 at /keystatic, edited the subtitle, saved. Diff was 19 lines: frontmatter re-serialised (quote style, key order, folded subtitle) and ordered-list markers renumbered to "1."; figures, captions, blockquotes and body text unchanged. Test edit reverted.
- 2026-09-20. Fact-check pass 2 (fresh-context Fable 5.1 agent, about 150 claims): all numbers, conversions and 31 quotations verified; verdict "safe to send to the owners after the A and B fixes".
