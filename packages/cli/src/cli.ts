#!/usr/bin/env node
import { version } from "../package.json";
import { cli } from "./shared";
//#region 翻译相关

cli
  .command("download", "生成翻译文件")
  .example("dune download")
  .action(async () => {
    const { download } = await import("./commands/download");
    await download();
  });
cli
  .command("extract", "提取代码中的文案")
  .option("--deleteUnused", "删除未使用的文案")
  .example("dune extract")
  .action(async (args) => {
    const { extract } = await import("./commands/extract");
    await extract(args);
  });

cli
  .command("namespaceSwc", "添加 namespace 前缀，由 swc 驱动")
  .example("dune namespaceSwc")
  .action(async () => {
    const { namespace } = await import("./commands/namespace");
    return namespace({ mode: "swc" });
  });

cli
  .command("namespaceReg", "添加 namespace 前缀，由正则驱动")
  .example("dune namespaceReg")
  .action(async () => {
    const { namespace } = await import("./commands/namespace");
    return namespace({ mode: "reg" });
  });

cli
  .command("upload", "上传翻译文件")
  .example("dune upload")
  .action(async (args) => {
    const { upload } = await import("./commands/upload");
    await upload();
  });

cli
  .command("downloadFromPlatform", "从翻译平台下载文件")
  .example("dune downloadFromPlatform")
  .action(async () => {
    const { downloadFromPlatform } = await import(
      "./commands/downloadFromPlatform"
    );
    await downloadFromPlatform();
  });
//#endregion

//#region api 相关
cli
  .command("generateApi", "生成 api 文件")
  .example("dune generateApi")
  .action(async () => {
    const { generateApi } = await import("./commands/generateApi");
    await generateApi();
  });
//#endregion

//#region user 相关
cli.command("login", "登录").action(async () => {
  const { googleAuth } = await import("./shared/google/auth");
  await googleAuth.initCredentials();
});
cli.command("logout", "退出").action(async () => {
  const { googleAuth } = await import("./shared/google/auth");
  await googleAuth.removeCredentials();
});
cli.command("userInfo", "用户信息").action(async () => {
  const { googleAuth } = await import("./shared/google/auth");
  if (googleAuth.tokens) {
    console.log(`\
email: ${googleAuth.tokens.email}
aud  : ${googleAuth.tokens.aud}
exp  : ${new Date(googleAuth.tokens.expiry_date).toLocaleString()}
`);
  } else {
    console.log("未登录");
    console.log(`运行 dune login 登录`);
  }
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
