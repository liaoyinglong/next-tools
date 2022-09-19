/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    /**
     * @see https://nextjs.org/docs/advanced-features/compiler#swc-plugins-experimental
     */
    swcPlugins: [
      // [require.resolve("@scope/swc-plugin"), {}]
    ],
  },
};

module.exports = nextConfig;
