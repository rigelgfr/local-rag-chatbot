/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
};

module.exports = nextConfig;
