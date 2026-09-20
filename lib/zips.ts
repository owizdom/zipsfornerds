import fs from 'node:fs'
import path from 'node:path'
import { getArticles } from './content'

export type ZipEntry = { zip: number; title: string; status: string; upgrade: string; specUrl: string; articleSlug?: string }

export function getZips(): ZipEntry[] {
  const file = path.resolve(process.cwd(), process.env.ZIPS_FILE || 'zips/zips.json')
  const entries: ZipEntry[] = JSON.parse(fs.readFileSync(file, 'utf8'))
  const visible = new Map(getArticles().map((a) => [a.zip, a.slug]))
  // An explainer link appears only once that article is visible in this build.
  return entries.map((e) => ({ ...e, articleSlug: visible.get(e.zip) }))
}
