/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  // Disable type checking during build (we do this separately in CI)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable ESLint during build (we do this separately in CI)
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
