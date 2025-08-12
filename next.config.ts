import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
};

export default nextConfig;
