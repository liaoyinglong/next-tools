import path from 'path';
import { fileURLToPath } from 'url';
import { createMDX } from 'fumadocs-mdx/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX();

let basePath = '';
//#region in GitHub action build
if (process.env.GITHUB_REPOSITORY) {
  // eg: GITHUB_REPOSITORY = "dune2/some-tools"
  basePath = `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`;
  console.log(`basePath: ${basePath}`);
}
//#endregion

const config = {
  basePath,
  transpilePackages: ['@dune2/tools'],
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    emotion: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
