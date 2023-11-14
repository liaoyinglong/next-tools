const path = require("path");
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});
let basePath = "";
//#region in GitHub action build
if (process.env.GITHUB_REPOSITORY) {
  // eg: GITHUB_REPOSITORY = "dune2/some-tools"
  basePath = `/${process.env.GITHUB_REPOSITORY.split("/")[1]}`;
  console.log(`basePath: ${basePath}`);
}

//#endregion

module.exports = withNextra({
  basePath,
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
