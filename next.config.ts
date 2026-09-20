import type { NextConfig } from 'next'

const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: { unoptimized: true },
  turbopack: { root: import.meta.dirname },
  // Keystatic's GitHub App setup flow bounces through 127.0.0.1, which Next treats as a
  // cross-origin dev host and blocks, leaving the admin blank. Development only.
  allowedDevOrigins: ['127.0.0.1'],
}

export default config
