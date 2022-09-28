import { $, echo } from "zx";

echo("打包");
await $`pnpm build`;

echo("运行发布前的测试");
await $`pnpm test`;

echo("选择需要发布的包");
await $`pnpm changeset`;

echo("更新版本号");
await $`pnpm changeset version`;

echo("提交到git");

await $`git add .`;
await $`git commit -m "chore: update version"`;

echo("发布到npm");
await $`pnpm release`;

echo("推送到git");
await $`git push`;

echo("Done");
