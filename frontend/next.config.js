/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    },
    // Image optimization configuration
    images: {
        domains: [],
        unoptimized: false,
    },
    // Compression and performance
    compress: true,
    // Production source maps (optional, can disable for smaller builds)
    productionBrowserSourceMaps: false,
};

module.exports = nextConfig;