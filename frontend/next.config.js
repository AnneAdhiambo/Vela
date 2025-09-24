/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL,
  },
  // Fix workspace root detection
  outputFileTracingRoot: __dirname,
  // Disable ESLint during build (we'll handle it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig