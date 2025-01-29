import withNextra from "nextra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextraConfig = withNextra({
  latex: true,
  search: {
    codeblocks: false,
  },
});

let basePath = "";
//#region in GitHub action build
if (process.env.GITHUB_REPOSITORY) {
  // eg: GITHUB_REPOSITORY = "dune2/some-tools"
  basePath = `/${process.env.GITHUB_REPOSITORY.split("/")[1]}`;
  console.log(`basePath: ${basePath}`);
}
//#endregion

const config = {
  basePath,
  transpilePackages: ["@dune2/tools"],
  //output: "export",
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
  webpack: (config) => {
    config.module.rules.forEach((rule) => {
      if (rule.test?.test?.(".mdx")) {
        if (Array.isArray(rule.oneOf)) {
          rule.oneOf.forEach((item) => {
            if (Array.isArray(item.use)) {
              item.use.push({
                loader: path.resolve(
                  __dirname,
                  "./scripts/exampleInsetLoader.js",
                ),
              });
            }
          });
        }
      }
    });
    return config;
  },
};

export default withNextraConfig(config);
