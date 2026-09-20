import type { NextConfig } from 'next'

const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: { unoptimized: true },
  turbopack: { root: import.meta.dirname },
}

export default config
