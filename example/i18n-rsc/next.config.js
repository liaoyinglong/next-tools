/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: "export",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  transpilePackages: ["@dune2/tools"],
  webpack(config) {
    config.cache = false;

    return config;
  },
};
module.exports = config;
