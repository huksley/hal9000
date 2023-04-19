/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXTJS_STANDALONE === "1" ? "standalone" : undefined,
  reactStrictMode: true
};

module.exports = nextConfig;
