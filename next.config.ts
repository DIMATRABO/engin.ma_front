import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disable ESLint checks during build
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
