# Spec 0002: layout modelled on schemaresearch.xyz, Keystatic CMS, no personal name

- **Status:** PROPOSED. Requested by Wisdom on 20 Sep 2026: "model ours against this", "keep the colour", "remove all those my name", "the cms should allow us to edit", "we are building the full thing, no shortcut". He chose Keystatic (git-based) over Payload when asked.
- **Owner:** Claude Fable 5.1. Stacks on spec 0001 / PR #1.

## 1. Objective

1. The site follows the structure and design language of schemaresearch.xyz, studied in the browser on 20 Sep 2026, with our own palette (paper, ink, gold), our own copy and original artwork:
   - two-column hero: bold italic serif headline, paragraph, animated node diagram;
   - "Recent publications" bento grid: tag, title, cover image, dashed accent borders;
   - a dashed grid of scheduled ZIPs where Schema shows reader logos (we have no logos to show and will not invent any);
   - "How we work" dashed cards; three-column footer with an italic tagline;
   - `/research/` archive: label, large italic title, filter chips, sort toggle, rows with dashed dividers and thumbnails;
   - `/research/<slug>/` article: title card with cover, mono outline, italic accent section headings, dashed figure frames with mono captions;
   - `/method/` numbered principles page (their Thesis page); `/zips/` index (their Portfolio page);
   - active nav item as a filled box, scroll progress bar, load fade-in that respects reduced motion.
2. A full editing dashboard at `/keystatic` (Keystatic): articles collection with every frontmatter field, rich editor, cover and figure uploads; ZIP index as an editable singleton. Local mode on localhost now; GitHub mode on the live site once Wisdom creates the GitHub App.
3. Articles stay markdown files in the repo, so the grant's "source on GitHub, CC BY" promise holds.
4. Wisdom's name appears nowhere on the site.
5. The publish gate also runs inside the production build, so a CMS edit cannot publish an article that fails lint.

## 2. Non-goals

- No deployment, DNS or GitHub App creation. Those need Wisdom.
- No copied Schema assets, copy, logo or cartoon covers. No reader-logo wall.
- No database, no accounts, no comments.
- Analytics is opt-in and off by default (added 20 Sep 2026 at Wisdom's request, for the grant's readership metrics). Google Analytics is the one permitted exception to the zero-third-party rule, and only when `NEXT_PUBLIC_GA_ID` is set.
- Article #1 stays a draft.

## 3. Stack

Drops `output: 'export'` because the Keystatic admin needs route handlers. Public pages stay statically prerendered. Tests read the prerendered HTML from `.next/server/app`.

```
app/(site)/            home, research, research/[slug], zips, method, rss.xml, not-found
app/keystatic/         admin UI          app/api/keystatic/   admin API
keystatic.config.ts    collections: articles; singleton: zips
components/            Hero diagram, PublicationCard, ArchiveList (client filter), Progress bar
public/covers/         original cover art
zips/zips.json         now { "entries": [...] } so it can be a Keystatic singleton
```

## 4. Seam contract

```
Article gains: cover (string path), tag (string, e.g. "NU6.3")
getZips() reads zips.json .entries
lib/content.ts throws in a production build if a published article has lint violations
keystatic.config.ts storage: github when NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO is set, else local
```

## 5. Acceptance tests (automated unless marked L)

| # | Test | Passes when |
|---|---|---|
| AT1 | Routes exist | prerendered `/`, `/research`, `/zips`, `/method`, `/rss.xml` exist; `/about` and `/articles` do not |
| AT2 | Drafts never ship | only the published fixture has a `/research/<slug>` page, an archive row, a home card and an RSS item; the draft marker string appears nowhere in the build output |
| AT3 | Accountability block | unchanged from spec 0001, on the new route |
| AT4 | Zero third-party requests | unchanged, scanning prerendered HTML and built CSS |
| AT5-7 | Content lint, lint self-test, ZIP index consistency | unchanged, with the new zips.json shape |
| AT8 | RSS | unchanged |
| AT10 | Figures | unchanged |
| AT11 | Build refuses a dirty published article | a build whose articles dir holds a published article with an em dash exits non-zero and names the file |
| AT12 | No personal name | "Wisdom" and "Okechukwu" appear in no prerendered page, feed or site source file under app/, components/ and lib/ |
| AT13 | Schema structure present | home has hero diagram, recent publications, scheduled grid, how-we-work cards; archive has filter chips and a sort control; article has cover card and outline |
| AT14 | CMS wired | `keystatic.config.ts` declares the articles collection with every frontmatter key the loader reads, and the zips singleton; `/keystatic` and the API route exist in the build manifest |
| AT16 | Privacy claim matches reality | with analytics off: footer claims no trackers and no third-party script loads; with `NEXT_PUBLIC_GA_ID` set: the script loads, the measurement id reaches the page, and the footer names the provider instead of claiming no trackers |
| AT15 | CMS is not an open door | in a production server started without GitHub credentials, `/api/keystatic/...` does not serve repository files |
| AT17 | Hostile content is inert | a published article whose caption, alt text, links and raw HTML all attempt injection builds successfully and emits no script tag, no `javascript:` or `data:text/html` URL and no inline event handler |
| AT18 | Production ignores SHOW_DRAFTS | a production build with `SHOW_DRAFTS=1` still produces no draft route, title or slug |
| AT9 | Tripwire | zero tests or any skip fails the run |
| AL1 | Looks right at 390px and 1280px, side by side with schemaresearch.xyz | L |

## 6. Pre-mortem

| # | Failure | Mitigation |
|---|---|---|
| 1 | It reads as a rip-off of Schema | own palette, own copy, original SVG covers and diagram, no logos; structure and typographic language only |
| 2 | The CMS publishes an unverified article | AT11: the build itself fails; Vercel keeps the previous deployment |
| 3 | Keystatic rewrites article markdown and breaks figures | round-trip check: open and save article #1 in the CMS locally, diff the file, run the gate |
| 4 | /keystatic exposes the repo in production | AT15 |
| 5 | Name removal misses a spot | AT12 scans output and source |

## 7. Rollout, rollback, removal

- Rollout: draft PR #2 stacked on #1. Wisdom merges in order.
- Rollback: revert PR #2; v1 remains intact.
- Removal: `/articles/*` and `/about` are removed outright (nothing was ever deployed, so no redirects are needed).
