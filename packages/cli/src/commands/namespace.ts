import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import enquirer from "enquirer";
import _ from "lodash";
import { globby } from "globby";
import fs from "fs-extra";
import pMap from "p-map";
import pc from "picocolors";
import path from "path";

const { prompt } = enquirer;

const log = createLogger("namespace");

export async function namespace() {
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

  for (const namespace of namespaces) {
    const namespaceConfig = i18nConfig.namespace?.[namespace];

    const combined = _.map(_.castArray(namespaceConfig), (v) =>
      path.join(`./${v}/**/**.{js,jsx,ts,tsx}`)
    );

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

    await pMap(files, async (file) => {
      const content = await fs.readFile(file, "utf-8");

      async function transform(content: string, param2: { namespace: string }) {
        return content;
      }

      // TODO: 调用 wasm 处理 传递 namespace
      const newContent = await transform(content, { namespace });

      await fs.writeFile(file, newContent);
    });
  }
}
