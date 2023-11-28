#!/usr/bin/env node
import { version } from "../package.json";
import { download } from "./commands/download";
import { downloadFromPlatform } from "./commands/downloadFromPlatform";
import { extract } from "./commands/extract";
import { generateApi } from "./commands/generateApi";
import { initConfig } from "./commands/initConfig";
import { interactive } from "./commands/interactive";
import { namespace } from "./commands/namespace";
import { upload } from "./commands/upload";
import { cli } from "./shared";
//#region 翻译相关

cli
  .command("download", "生成翻译文件")
  .example("dune download")
  .action(download);
cli
  .command("extract", "提取代码中的文案")
  .option("--deleteUnused", "删除未使用的文案")
  .example("dune extract")
  .action(extract);

cli
  .command("namespaceSwc", "添加namespace前缀，由swc驱动")
  .example("dune namespaceSwc")
  .action(() => {
    return namespace({ mode: "swc" });
  });

cli
  .command("namespaceReg", "添加namespace前缀，由正则驱动")
  .example("dune namespaceReg")
  .action(() => {
    return namespace({ mode: "reg" });
  });

cli.command("upload", "上传翻译文件").example("dune upload").action(upload);

cli
  .command("downloadFromPlatform", "从翻译平台下载文件")
  .example("dune downloadFromPlatform")
  .action(downloadFromPlatform);
//#endregion

//#region api 相关
cli
  .command("generateApi", "生成api文件")
  .example("dune generateApi")
  .action(generateApi);
//#endregion

cli.command("init", "初始化配置文件").example("dune init").action(initConfig);

cli
  .command("interactive", "交互式操作")
  .example("dune interactive")
  .alias("i")
  .action(interactive);

// make default command run interactive
cli.command("").action(interactive);

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
