const path = require("path");
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

module.exports = withNextra({
  transpilePackages: ["@dune2/tools"],
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    emotion: true,
  },
  images: {
    unoptimized: true,
  },
  pageExtensions: ["mdx", "md", "page.tsx"],
  webpack: (config) => {
    config.module.rules.forEach((rule) => {
      if (rule.test?.test(".mdx")) {
        if (Array.isArray(rule.use)) {
          rule.use.push({
            loader: path.resolve(__dirname, "./scripts/exampleInsetLoader.js"),
          });
        }
      }
    });
    return config;
  },
});
