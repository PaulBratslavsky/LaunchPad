/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT || undefined,
  // Enable Next.js 16 cache components
  cacheComponents: true,
  experimental: {
    // Next 16.3 validates every route for instant navigation in dev by default.
    // Content is fetched uncached on purpose in development and in draft mode
    // (Strapi preview), so every route was reported as blocking. Validate only
    // segments that opt in with `export const instant = true`. Dev-only; the
    // build is unaffected.
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },
  turbopack: {
    root: process.cwd().replace('/next', ''),
  },
  images: {
    // Disable image optimization for localhost in development
    ...(process.env.NODE_ENV === 'development' ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.IMAGE_HOSTNAME || 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.strapiapp.com',
      },
    ],
  },
  pageExtensions: ['ts', 'tsx'],
  async redirects() {
    if (process.env.NEXT_PUBLIC_API_URL === undefined) {
      console.warn(
        '[next.config] NEXT_PUBLIC_API_URL is not defined. Skipping redirect generation.'
      );
      return [];
    }

    let redirections = [];
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/redirections`
      );
      const result = await res.json();
      const redirectItems = result.data.map(({ source, destination }) => {
        return {
          source: `/:locale${source}`,
          destination: `/:locale${destination}`,
          permanent: false,
        };
      });

      redirections = redirections.concat(redirectItems);

      return redirections;
    } catch (error) {
      // Log warning but don't fail build - redirects are optional
      console.warn(
        '[next.config] Failed to fetch redirects from Strapi:',
        error instanceof Error ? error.message : error
      );
      return [];
    }
  },
};

export default nextConfig;
