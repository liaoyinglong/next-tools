const path = require("path");
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

module.exports = withNextra({
  transpilePackages: ["@dune2/tools"],
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
