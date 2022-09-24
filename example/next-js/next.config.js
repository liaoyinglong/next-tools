const pluginPath = require.resolve("@scope/swc-plugin");
console.log("use pluginPath", pluginPath);

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
  webpack: (config, { isServer }) => {
    config.optimization.minimizer = [];
    config.plugins.unshift(
      require("unplugin-auto-import/webpack")({
        imports: [
          "react",
          {
            "@scope/i18n": ["t", "Trans"],
          },
        ],
      })
    );
    return config;
  },
  experimental: {
    externalDir: !!1,
    /**
     * @see https://nextjs.org/docs/advanced-features/compiler#swc-plugins-experimental
     */
    swcPlugins: [
      ["next-superjson-plugin", {}],
      [pluginPath, {}],
    ],
  },
};

module.exports = nextConfig;
