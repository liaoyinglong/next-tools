import fs from "fs-extra";
import { globby } from "globby";
import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import { I18nData, ExtractedMap } from "../shared/i18nData";
import pc from "picocolors";

const log = createLogger("extract");

export async function extract() {
  const config = await getConfig();
  const { extract } = await import("@dune2/wasm");

  // 这是使得任务串行，方便看日志
  for (const configItem of config.i18n ?? []) {
    const files = await globby(
      [`**/**.{js,jsx,ts,tsx}`, "!**/node_modules/**", "!**.d.ts"],
      {
        cwd: configItem.cwd,
      }
    );
    log.info("预计共解析 %s 个文件", pc.green(files.length));
    const extractedI18nDataMap: ExtractedMap = new Map();
    await pMap(
      files,
      async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const res: ExtractedMap = await extract(content);
        log.info(
          "从 %s 中提取到 %s 条文案",
          pc.dim(file),
          res.size ? pc.green(res.size) : res.size
        );
        res.forEach((value, key) => {
          const cur = extractedI18nDataMap.get(key);
          // 优先保留有 messages 的
          if (!cur?.messages) {
            extractedI18nDataMap.set(key, value);
          }
        });
      },
      { concurrency: 20 }
    );
    log.info(
      "总统提取到 %s 条文案 %O",
      pc.green(extractedI18nDataMap.size),
      extractedI18nDataMap
    );

    const statistics = await pMap(
      configItem.locales ?? [],
      async (locale, index) => {
        const i18nData = new I18nData(locale, configItem);
        await i18nData.updateByExtractedData(extractedI18nDataMap, index === 0);
        await i18nData.saveToDisk();
        return await i18nData.statistic();
      }
    );
    I18nData.printStatistic("提取结果: ", statistics);
  }
}
