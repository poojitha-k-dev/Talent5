/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com', 'cdn.freesound.org', 'commondatastorage.googleapis.com'],
  },
  webpack: (config) => {
    config.externals.push({
      'pg-native': 'pg-native',
    });
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
