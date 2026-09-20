// The admin is reachable in development (local files) and, in production, only when GitHub mode is configured.
// Without this, a production server in local mode would expose repository files through the admin API.
export const cmsEnabled = process.env.NODE_ENV !== 'production' || Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO)
