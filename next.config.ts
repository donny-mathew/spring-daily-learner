import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow fetching from spring.io for RSS
  async headers() {
    return [];
  },
};

export default nextConfig;
