const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

module.exports = withNextra({
  transpilePackages: ["@dune2/tools"],
});
