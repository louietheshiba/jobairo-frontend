/* eslint-disable import/no-extraneous-dependencies */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

export default withBundleAnalyzer({
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
