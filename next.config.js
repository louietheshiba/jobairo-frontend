/* eslint-disable import/no-extraneous-dependencies */
const bundleAnalyzer = require('@next/bundle-analyzer');

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

module.exports = withBundleAnalyzer({
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  trailingSlash: false,
  basePath: '',
  reactStrictMode: true,
  // Configure for Netlify deployment
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/locations',
        destination: 'https://hiring.cafe/api/searchLocation',
      },
    ];
  },
});
