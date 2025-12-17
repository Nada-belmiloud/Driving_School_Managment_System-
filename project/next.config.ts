import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Disable image optimization for Electron (no server-side optimization)
  images: {
    unoptimized: true
  },
  typescript: {
    // Temporarily ignore build errors for packaging
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
