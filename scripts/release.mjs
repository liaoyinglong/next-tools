import { $, echo } from "zx";

echo("打包");
await $`pnpm build`;

echo("运行发布前的测试");
await $`pnpm test`;

// @see https://jstools.dev/version-bump-prompt/
// bump [release] [options] [files...]
// Automatically (or with prompts) bump your version number, commit changes, tag, and push to Git
// release:
//     The release version or type.  Can be one of the following:
//     - A semver version number (ex: 1.23.456)
// - prompt: Prompt for the version number (this is the default)
// - major: Increase major version
// - minor: Increase minor version
// - patch: Increase patch version
// - premajor: Increase major version, pre-release
// - preminor: Increase preminor version, pre-release
// - prepatch: Increase prepatch version, pre-release
// - prerelease: Increase prerelease version
await $`pnpm bumpp patch packages/*/package.json --no-tag`;

echo("提交到git done");

echo("发布到npm");
await $`pnpm publish -r`;

echo("Done");
