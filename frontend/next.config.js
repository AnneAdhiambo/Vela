/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL,
  },
}

module.exports = nextConfig