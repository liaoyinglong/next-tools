const { withDunePresets } = require("@dune2/next-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
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
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = withDunePresets()(nextConfig);
