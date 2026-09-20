import { config, collection, singleton, fields } from '@keystatic/core'

// GitHub mode on the live site (set NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo), local files everywhere else.
const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO

const zipStatuses = ['Draft', 'Proposed', 'Active', 'Implemented', 'Final', 'Reserved', 'Withdrawn', 'Rejected', 'Obsolete'].map((v) => ({ label: v, value: v }))

export default config({
  storage: repo ? { kind: 'github', repo: repo as `${string}/${string}` } : { kind: 'local' },
  ui: { brand: { name: 'ZIPs For Nerds' }, navigation: { Writing: ['articles'], Coverage: ['zips'] } },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'articles/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['zip', 'status', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        series_number: fields.integer({ label: 'Series number', validation: { isRequired: true, min: 1 } }),
        subtitle: fields.text({ label: 'Subtitle', multiline: true }),
        zip: fields.integer({ label: 'ZIP number', validation: { isRequired: true } }),
        zip_status: fields.select({ label: 'ZIP status (copy from zips.z.cash)', options: zipStatuses, defaultValue: 'Draft' }),
        zip_category: fields.text({ label: 'ZIP category, e.g. Wallet or Consensus' }),
        spec_url: fields.url({ label: 'Spec URL', validation: { isRequired: true } }),
        tag: fields.text({ label: 'Tag shown on cards, e.g. NU6.3 or NU7' }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        status: fields.select({
          label: 'Publishing status',
          description: 'Draft articles never reach the live site. A published article that fails the lint gate fails the build.',
          options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
          defaultValue: 'draft',
        }),
        disclosure: fields.text({
          label: 'AI disclosure',
          multiline: true,
          description: 'Shown on the article page. Edit it to match how this particular article was made, and make sure it is true on the day you publish.',
          defaultValue: "Researched with AI assistance, working from the ZIP text and the sources listed at the end. Every number, quotation and mechanism was checked against those sources in two further review passes. Any errors are the author's own.",
        }),
        corrections: fields.array(fields.text({ label: 'Correction, starting with the date' }), { label: 'Corrections log', itemLabel: (p) => p.value || 'New correction' }),
        cover: fields.image({ label: 'Cover image', directory: 'public/covers', publicPath: '/covers/' }),
        content: fields.markdoc({ label: 'Content', extension: 'md', options: { image: { directory: 'public/figures', publicPath: '/figures/' } } }),
      },
    }),
  },
  singletons: {
    zips: singleton({
      label: 'ZIP index',
      path: 'zips/zips',
      format: { data: 'json' },
      schema: {
        entries: fields.array(
          fields.object({
            zip: fields.integer({ label: 'ZIP number', validation: { isRequired: true } }),
            title: fields.text({ label: 'Title' }),
            status: fields.select({ label: 'Status', options: zipStatuses, defaultValue: 'Draft' }),
            upgrade: fields.text({ label: 'Upgrade, e.g. NU6.3 or NU7 candidate' }),
            specUrl: fields.url({ label: 'Spec URL' }),
          }),
          { label: 'Scheduled ZIPs', itemLabel: (p) => `ZIP ${p.fields.zip.value ?? ''} ${p.fields.title.value}` },
        ),
      },
    }),
  },
})
