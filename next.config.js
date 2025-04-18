/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  distDir: '.next',
  poweredByHeader: false,
  env: {
    PORT: process.env.PORT || 3000
  }
}

module.exports = nextConfig 