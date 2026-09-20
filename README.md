# ZIPs For Nerds

One Zcash Improvement Proposal per article, explained properly. Site: https://zipsfornerds.com

## Work on it

```
npm install
npm run dev      # http://localhost:3000, drafts visible and marked as unpublished previews
                 # the CMS is at /keystatic
npm test         # builds from fixtures, runs every acceptance test (a few minutes), fails on zero tests or any skip
npm run build    # production build, drafts excluded, fails if a published article fails lint
```

## Edit in the CMS

Open `/keystatic` while `npm run dev` is running. Articles and the ZIP index are editable there; saving writes the markdown and JSON files in this repo, so every change is a normal git diff. On the live site the CMS stays switched off (404) until `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo` is set and the Keystatic GitHub App is created; then editors sign in with GitHub and saves become commits.

## Add an article

1. Add a markdown file to `articles/` with the frontmatter used by the existing one. Keep `status: draft`.
2. Figures go in `public/figures/<slug>/`. An image with a title renders as a captioned figure: `![alt](/figures/x/fig.svg "Caption.")`.
3. When the fact-check is applied, the ZIP's owners have had the draft, and every bracket placeholder is resolved, set `status: published`. `npm test` and the production build both refuse a published article that contains an em or en dash, an unresolved `[PLACEHOLDER]`, or a banned affiliation.
4. Update `zips/zips.json` if a ZIP's status changed.

## Layout

```
app/        (site)/ public pages: home, research, research/[slug], zips, method; keystatic/ and api/keystatic/ for the CMS; rss.xml
components/ nav, hero diagram, archive list, progress bar
keystatic.config.ts   CMS collections and fields
articles/   the articles, as markdown
zips/       zips.json, the coverage index
lib/        content loading, ZIP index, publish lint
public/     figures and static files
scripts/    test gate and figure generators
tests/      acceptance tests and fixtures
docs/       spec, TASKS, JOURNAL
```

Articles are licensed CC BY 4.0. The site makes no third-party requests.
