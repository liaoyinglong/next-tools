const pluginPath = require.resolve("@dune2/swc-plugin");
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
            "@dune2/i18n": ["t", "Trans"],
          },
        ],
      }),
      require("@dune2/unplugin").i18nResourcePlugin.webpack()
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
