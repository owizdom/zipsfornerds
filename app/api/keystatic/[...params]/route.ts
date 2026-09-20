import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '@/keystatic.config'
import { cmsEnabled } from '@/lib/cms'

const handler = makeRouteHandler({ config })
const blocked = () => new Response('Not found', { status: 404 })

export const GET = cmsEnabled ? handler.GET : blocked
export const POST = cmsEnabled ? handler.POST : blocked
