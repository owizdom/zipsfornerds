# JOURNAL

## Snapshot (20 Sep 2026)

- Repo: owizdom/zipsfornerds, PRIVATE. Branch `agent/site-v1`. Domain zipsfornerds.com registered at Namecheap 20 Sep 2026 (whois creation 05:32:50Z). Nothing deployed.
- Site v1 (spec 0001) built. Gate: 9 tests, 9 pass, 0 skipped, green 3 runs in a row.
- Article #1 (ZIP 318) is `status: draft`: excluded from production builds. Fact-check pass 1 (fresh-context agent, Fable 5.1) found 3 errors, 22 imprecise items, 5 unsupported claims; all applied in the rewrite. Pass 2 on the rewrite is pending.
- Open before publishing article #1: pass 2 results, Wisdom reads and edits it, disclosure line filled in truthfully, CipherScan numbers refreshed, draft sent to the ZIP's owners.
- Open before deploying: Wisdom's explicit OK, Vercel project, DNS at Namecheap.

## Evidence log (append-only)

- 2026-09-20. Spec committed before tests (878bbf3). Failing tests committed before implementation (adcc87c); recorded failure: "GATE FAILED: fixture build did not succeed" (no app directory yet).
- 2026-09-20. First green run after implementation: tests=8 pass=8. After adding AT10 (figures): tests=9 pass=9, three consecutive runs.
- 2026-09-20. Real production build (no fixtures): routes /, /about, /zips, /rss.xml, /articles/_none (404 placeholder). rss.xml has 0 items. No zip-318 route. Home shows the "with reviewers" notice.
- 2026-09-20. ZIP list corrected against the ZIP pages themselves: ZIP 230 is Withdrawn (live v6 format is ZIP 229); ZIP 2006 is Reserved with no text (replaced by ZIP 258). The zips.z.cash NU7 candidate list still names ZIP 230.
- 2026-09-20. Models: architect, tests, implementation and article draft by Claude Fable 5.1 in one session. Fact-check pass 1 by a separate fresh-context Fable 5.1 agent.
