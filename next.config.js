/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    PORT: process.env.PORT || 8080
  }
}

module.exports = nextConfig 