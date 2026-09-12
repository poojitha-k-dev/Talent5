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
  }
};

module.exports = nextConfig;
