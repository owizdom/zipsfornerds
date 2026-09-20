import { config, collection, singleton, fields } from '@keystatic/core'
import { block } from '@keystatic/core/content-components'

// GitHub mode on the live site (set NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo), local files everywhere else.
const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO

const zipStatuses = ['Draft', 'Proposed', 'Active', 'Implemented', 'Final', 'Reserved', 'Withdrawn', 'Rejected', 'Obsolete']
  .map((v) => ({ label: v, value: v }))

const DISCLOSURE =
  "Researched with AI assistance, working from the ZIP text and the sources listed at the end. " +
  "Every number, quotation and mechanism was checked against those sources in two further review passes. " +
  "Any errors are the author's own."

/**
 * A figure with a real caption field.
 *
 * Markdown images hide the caption in the title attribute, which is invisible in an
 * editor and easy to lose. This writes a Markdoc tag that lib/markdoc-tags.ts turns
 * back into a captioned image at build time, so the caption is a labelled box here
 * and the published page is unchanged.
 */
const figure = block({
  label: 'Figure',
  description: 'An image with a caption and alt text. Use this instead of a bare image.',
  schema: {
    src: fields.image({
      label: 'Image',
      description: 'SVG or PNG. Diagrams made by the scripts in scripts/figures/ are already in the repo and can be referenced by path instead.',
      directory: 'public/figures/uploads',
      publicPath: '/figures/uploads/',
      validation: { isRequired: true },
    }),
    alt: fields.text({
      label: 'Alt text',
      description: 'What the image shows, for screen readers and for anyone whose images fail to load. Describe the content, not the fact that it is a figure.',
      validation: { isRequired: true },
    }),
    caption: fields.text({
      label: 'Caption',
      description: 'Printed under the figure. Start with "Figure N." and say where the numbers came from.',
      multiline: true,
    }),
  },
  ContentView: (props) => props.value.caption || props.value.alt || 'Figure',
})

export default config({
  storage: repo ? { kind: 'github', repo: repo as `${string}/${string}` } : { kind: 'local' },
  ui: {
    brand: { name: 'ZIPs For Nerds' },
    navigation: { Writing: ['articles'], Coverage: ['zips'] },
  },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'articles/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['zip', 'status', 'date'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Written as "ZIP 318: Orchard to Ironwood Migration". The part before the colon is shown in bold on the article card.',
            validation: { isRequired: true },
          },
          slug: {
            description: 'The URL. Keep the ZIP number in it, and do not change it once the article is published.',
          },
        }),
        subtitle: fields.text({
          label: 'Subtitle',
          description: 'One sentence, shown in italics under the title and used as the description in search results and the RSS feed.',
          multiline: true,
        }),
        series_number: fields.integer({
          label: 'Series number',
          description: 'Shown as "ZIPs For Nerds #N". The next unused number.',
          validation: { isRequired: true, min: 1 },
        }),
        date: fields.date({
          label: 'Date',
          description: 'Sorts the archive and the RSS feed.',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: 'Publishing status',
          description:
            'Draft means the article does not exist on the live site: no page, no listing, no feed entry. Published puts it live about a minute after saving.',
          options: [
            { label: 'Draft, not on the live site', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),

        zip: fields.integer({
          label: 'ZIP number',
          description: 'The number alone, for example 318.',
          validation: { isRequired: true },
        }),
        zip_status: fields.select({
          label: 'ZIP status',
          description: 'Copy this from the ZIP\'s own page on zips.z.cash. Check it again before publishing, because statuses change.',
          options: zipStatuses,
          defaultValue: 'Draft',
        }),
        zip_category: fields.text({
          label: 'ZIP category',
          description: 'As written on the ZIP, for example "Wallet", "Consensus" or "Consensus / Ecosystem".',
        }),
        spec_url: fields.url({
          label: 'Spec URL',
          description: 'The ZIP page itself, for example https://zips.z.cash/zip-0318',
          validation: { isRequired: true },
        }),
        tag: fields.text({
          label: 'Tag',
          description: 'The badge on cards and in the archive filter, for example "NU6.3" or "NU7 candidate".',
        }),

        cover: fields.image({
          label: 'Cover image',
          description: 'Shown on the article card and in the archive. Landscape works best; the card crops the edges.',
          directory: 'public/covers',
          publicPath: '/covers/',
        }),
        disclosure: fields.text({
          label: 'AI disclosure',
          multiline: true,
          description: 'Shown on the article page. Edit it to match how this particular article was made, and make sure it is true on the day you publish.',
          defaultValue: DISCLOSURE,
        }),
        corrections: fields.array(
          fields.text({ label: 'Correction' }),
          {
            label: 'Corrections log',
            description: 'Add a line whenever the article is fixed after publishing. Start with the date, for example "21 Sep 2026: the fee is 15,000 zatoshis, not 20,000."',
            itemLabel: (p) => p.value || 'New correction',
          },
        ),

        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          description: 'Sections use Heading 2. End with a "Sources" heading and a list of links.',
          components: { figure },
          options: {
            image: {
              directory: 'public/figures/uploads',
              publicPath: '/figures/uploads/',
            },
          },
        }),
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
            title: fields.text({ label: 'Title', description: 'Exactly as the ZIP names itself.' }),
            status: fields.select({ label: 'Status', options: zipStatuses, defaultValue: 'Draft' }),
            upgrade: fields.text({ label: 'Upgrade', description: 'For example "NU6.3" or "NU7 candidate".' }),
            specUrl: fields.url({ label: 'Spec URL' }),
          }),
          {
            label: 'Scheduled ZIPs',
            description: 'Drives the coverage grid on the home page and the ZIP index page. An explainer links itself here automatically once it is published.',
            itemLabel: (p) => `ZIP ${p.fields.zip.value ?? ''} ${p.fields.title.value}`,
          },
        ),
      },
    }),
  },
})
