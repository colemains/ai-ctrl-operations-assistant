/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ai-ctrl/contracts', '@ai-ctrl/authz'],
}

module.exports = nextConfig