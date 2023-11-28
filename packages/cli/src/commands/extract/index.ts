import fs from "fs-extra";
import { globby } from "globby";
import os from "os";
import pMap from "p-map";
import path from "path";
import pc from "picocolors";
import { createLogger } from "../../shared";
import { getConfig, I18nConfig } from "../../shared/config";
import { ExtractedMap, I18nData } from "../../shared/i18nData";
import { promptI18nConfigEnable } from "../../shared/promptConfigEnable";

const log = createLogger("extract");

/**
 * 提取文案
 */
export async function extract(opts?: { deleteUnused: boolean }) {
  const config = await getConfig();
  const { extract } = await import("@dune2/wasm");

  let i18nConfigs = await promptI18nConfigEnable(
    config.i18n?.filter((item) => !item.disableExtract)
  );

  // 这是使得任务串行，方便看日志
  for (const configItem of i18nConfigs) {
    const files = await globby(
      [
        `./src/**/**.{js,jsx,ts,tsx}`,
        "!**/node_modules/**",
        "!**.d.ts",
        "!**/.next/**",
        "!**/out/**",
      ].concat(configItem.include ?? []),
      { cwd: configItem.cwd }
    );
    log.info("预计共解析 %s 个文件", pc.green(files.length));
    let errMsgs: string[] = [];
    const extractedI18nDataMap: ExtractedMap = new Map();

    await pMap(
      files,
      async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const res = await extract(content, file);
        if (res.data.size) {
          log.info(
            "从 %s 中提取到 %s 条文案",
            pc.dim(file),
            pc.green(res.data.size)
          );
          res.data.forEach((value, key) => {
            let cur = extractedI18nDataMap.get(key)!;
            const hasCache = !!cur;
            if (!hasCache) {
              cur = { ...value, files: [] };
            }
            cur.files.push(
              path.resolve(file) + ":" + value.line + ":" + value.column
            );
            // 优先使用 提取出来的文案
            cur.messages = value.messages || cur.messages;

            if (!hasCache) {
              extractedI18nDataMap.set(key, cur);
            }
          });
        }
        if (res.errMsg) {
          errMsgs.push(res.errMsg);
        }
      },
      { concurrency: 20 }
    );

    await saveExtractedMetaData(configItem, extractedI18nDataMap);

    const i18nDataArr = await pMap(configItem.locales ?? [], async (locale) => {
      const i18nData = new I18nData(locale, configItem, opts?.deleteUnused);
      await i18nData.updateByExtractedData(extractedI18nDataMap);
      await i18nData.saveToDisk();
      return i18nData;
    });
    if (errMsgs.length) {
      console.log(pc.bold("以下未能成功提取的文案，请手动处理："));
      console.log(errMsgs.join(os.EOL));
    }
    I18nData.printStatistic("提取结果: ", i18nDataArr);

    await import("./uploadToTranslatePlatform").then((mod) =>
      mod.uploadToTranslatePlatform(configItem, i18nDataArr)
    );
  }
}

/**
 * 保存相关的提取信息
 */
async function saveExtractedMetaData(
  config: I18nConfig,
  extractedI18nDataMap: ExtractedMap
) {
  const { i18nDir } = config;
  // case:
  //   input: "./src/i18n"
  //   output: "src_i18n.extractedLog.json"
  const prefix = i18nDir!.replace("./", "").replace(/\//g, "_");
  const filename = `${prefix}.extractedLog.json`;

  const metaDataJsonPath = path.join(i18nDir!, filename);

  await fs.ensureFile(metaDataJsonPath);

  // extractedI18nDataMap 是个 Map 需要转成换json
  let data = Array.from(extractedI18nDataMap.entries()).map(
    ([key, value]) => value
  );
  // 按照 id 排序
  data = data.sort((a, b) => {
    return a.id.localeCompare(b.id);
  });

  await fs.writeJSON(
    metaDataJsonPath,

    data,
    {
      spaces: 2,
    }
  );
}
