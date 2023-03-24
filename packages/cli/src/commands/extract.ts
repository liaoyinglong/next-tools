import fs from "fs-extra";
import { globby } from "globby";
import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import { ExtractedMap, I18nData } from "../shared/i18nData";
import pc from "picocolors";
import os from "os";
import { promptI18nConfigEnable } from "../shared/promptConfigEnable";
import path from "path";

const log = createLogger("extract");

/**
 * 提取文案
 */
export async function extract(opts?: { deleteUnused: boolean }) {
  const config = await getConfig();
  const { extract } = await import("@dune2/wasm");

  let i18nConfigs = await promptI18nConfigEnable(config.i18n);

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
            cur.files.push(res.filename);
            // 优先保留有 messages 的
            cur.messages = cur.messages || value.messages;

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

    await saveDebugLog(config.cacheDir!, extractedI18nDataMap);

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
  }
}

async function saveDebugLog(dir: string, extractedI18nDataMap: ExtractedMap) {
  await fs.ensureDirSync(dir);
  // extractedI18nDataMap 是个 Map 需要转成换json

  await fs.writeJSON(
    path.join(dir, "extractedI18nDataMap.json"),

    Array.from(extractedI18nDataMap.entries()).map(([key, value]) => value),
    {
      spaces: 2,
    }
  );
}
