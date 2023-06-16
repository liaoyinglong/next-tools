import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import enquirer from "enquirer";
import _ from "lodash";
import { globby } from "globby";
import fs from "fs-extra";
import pMap from "p-map";
import pc from "picocolors";
import { formatFile } from "../shared/formatFile";
import { autoNamespaceByReg } from "../shared/autoNamespaceByReg";

const { prompt } = enquirer;

const log = createLogger("namespace");
interface Params {
  /**
   * 生成模式
   *
   * - swc 指的是用swc 插件来添加 前缀
   *
   * swc 生成的代码更加规范，但是会有一些问题
   *
   * - reg 指的是用正则来添加 前缀
   *
   * reg 目前只能初始 t function 的调用，不能处理 Trans 组件的复杂
   * @default swc
   */
  mode?: "swc" | "reg";
}

export async function namespace(params: Params) {
  const { mode = "swc" } = params;
  const config = await getConfig();

  // 不允许提取的 配置 不需要选择
  let i18nConfigs = config.i18n?.filter((item) => !item.disableExtract);
  if (!i18nConfigs) {
    log.info("没有配置 i18n");
    return;
  }

  // 选择 生效的 i18n 配置
  const { i18nDir } = await prompt<{ i18nDir: string }>({
    type: "select",
    name: "i18nDir",
    message: "选择要生效的配置项",
    choices: i18nConfigs.map((item) => {
      return {
        name: item.i18nDir!,
        hint: `sheetRange: ${item.sheetRange}`,
      };
    }),
  });
  let i18nConfig = i18nConfigs.find((item) => item.i18nDir === i18nDir);
  if (!i18nConfig) {
    log.info("没有找到对应的配置");
    return;
  }

  // 选择 生效的 namespace
  const { namespaces } = await prompt<{ namespaces: string[] }>({
    type: "multiselect",
    message: "选择要生效的配置项",
    hint: "(空格选中，回车确认)",
    name: "namespaces",
    validate(value) {
      return value.length === 0 ? `至少选择一项` : true;
    },
    choices: _.map(i18nConfig.namespace, (v, k) => {
      return {
        name: k,
      };
    }),
  });

  const autoNamespace = await (() => {
    if (mode === "swc") {
      log.info("使用 swc 来处理");
      return import("@dune2/wasm").then((m) => m.autoNamespace);
    }
    log.info("使用 reg 来处理");
    return autoNamespaceByReg;
  })();

  for (const namespace of namespaces) {
    const namespaceConfig = i18nConfig.namespace?.[namespace];

    const suffix = `**/**.{js,jsx,ts,tsx}`;
    const combined = _.map(_.castArray(namespaceConfig), (v) => {
      v = v.endsWith("/") ? v : v + "/";
      return v + suffix;
    });
    log.info("正在处理 namespace: %s", pc.green(namespace));
    log.info("预计处理的文件路径: %s", pc.green(combined.join("\n")));

    const files = await globby(
      [
        "!**/node_modules/**",
        "!**.d.ts",
        "!**/.next/**",
        "!**/out/**",
        //
      ].concat(combined),
      { cwd: i18nConfig.cwd }
    );

    log.info("预计共处理 %s 个文件", pc.green(files.length));

    let transformedFileSet = new Set<string>();

    await pMap(files, async (file) => {
      const content = await fs.readFile(file, "utf-8");

      const newContent = await autoNamespace(
        content,
        namespace,
        i18nConfig!.namespaceSeparator!
      );

      if (newContent) {
        await fs.writeFile(file, newContent);
        await formatFile(file);
        transformedFileSet.add(file);
      }
    });
    log.info(
      "已为 %s 个文件 自动添加 namespace",
      pc.green(transformedFileSet.size)
    );
  }
}
