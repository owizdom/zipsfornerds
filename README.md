# ZIPs For Nerds

One Zcash Improvement Proposal per article, explained properly. Site: https://zipsfornerds.com

## Work on it

```
npm install
npm run dev      # http://localhost:3000, drafts visible and marked UNPUBLISHED PREVIEW
npm test         # builds from fixtures, runs every acceptance test, fails on zero tests or any skip
npm run build    # production build into out/, drafts excluded
```

## Add an article

1. Add a markdown file to `articles/` with the frontmatter used by the existing one. Keep `status: draft`.
2. Figures go in `public/figures/<slug>/`. An image with a title renders as a captioned figure: `![alt](/figures/x/fig.svg "Caption.")`.
3. When the fact-check is applied, the ZIP's owners have had the draft, and every bracket placeholder is resolved, set `status: published`. `npm test` refuses a published article that contains an em or en dash, an unresolved `[PLACEHOLDER]`, or a banned affiliation.
4. Update `zips/zips.json` if a ZIP's status changed.

## Layout

```
app/        routes (home, articles/[slug], zips, about, rss.xml)
articles/   the articles, as markdown
zips/       zips.json, the coverage index
lib/        content loading, ZIP index, publish lint
public/     figures and static files
scripts/    test gate and figure generators
tests/      acceptance tests and fixtures
docs/       spec, TASKS, JOURNAL
```

Articles are licensed CC BY 4.0. The site makes no third-party requests.
