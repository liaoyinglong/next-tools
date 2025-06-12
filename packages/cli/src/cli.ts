#!/usr/bin/env node
import { version } from "../package.json";
import { cli } from "./shared";

//#region api 相关
cli
  .command("generateApi", "生成 api 文件")
  .example("dune generateApi")
  .action(async () => {
    const { generateApi } = await import("./commands/generateApi");
    await generateApi();
  });
//#endregion

cli
  .command("init", "初始化配置文件")
  .example("dune init")
  .action(async () => {
    const { initConfig } = await import("./commands/initConfig");
    await initConfig();
  });

cli
  .command("interactive", "交互式操作")
  .example("dune interactive")
  .alias("i")
  .action(async (args) => {
    const { interactive } = await import("./commands/interactive");
    await interactive(args);
  });

// make default command run interactive
cli.command("").action(async (args) => {
  const { interactive } = await import("./commands/interactive");
  await interactive(args);
});

cli.version(version);
cli.help();

(async () => {
  try {
    // Parse CLI args without running the command
    cli.parse(process.argv, { run: false });
    // Run the command yourself
    // You only need `await` when your command action returns a Promise
    await cli.runMatchedCommand();
  } catch (error) {
    // Handle error here..
    // e.g.
    // console.error(error.stack)
    // process.exit(1)
  }
})();
