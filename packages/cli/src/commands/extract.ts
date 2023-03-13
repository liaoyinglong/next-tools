import fs from "fs-extra";
import { globby } from "globby";
import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import { ExtractedMap, I18nData } from "../shared/i18nData";
import pc from "picocolors";
import os from "os";
import { promptI18nConfigEnable } from "../shared/promptConfigEnable";

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
      ],
      { cwd: configItem.cwd }
    );
    log.info("预计共解析 %s 个文件", pc.green(files.length));
    let errMsgs: string[] = [];
    const extractedI18nDataMap: ExtractedMap = new Map();
    await pMap(
      files,
      async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const res: { data: ExtractedMap; errMsg: string } = await extract(
          content,
          file
        );
        if (res.data.size) {
          log.info(
            "从 %s 中提取到 %s 条文案",
            pc.dim(file),
            pc.green(res.data.size)
          );
          res.data.forEach((value, key) => {
            const cur = extractedI18nDataMap.get(key);
            // 优先保留有 messages 的
            if (!cur?.messages) {
              extractedI18nDataMap.set(key, value);
            }
          });
        }
        if (res.errMsg) {
          errMsgs.push(res.errMsg);
        }
      },
      { concurrency: 20 }
    );

    const statistics = await pMap(configItem.locales ?? [], async (locale) => {
      const i18nData = new I18nData(locale, configItem);
      await i18nData.updateByExtractedData(
        extractedI18nDataMap,
        locale === configItem.defaultLocale,
        opts?.deleteUnused
      );
      await i18nData.saveToDisk();
      return await i18nData.statistic();
    });
    if (errMsgs.length) {
      console.log(pc.bold("以下未能成功提取的文案，请手动处理："));
      console.log(errMsgs.join(os.EOL));
    }
    I18nData.printStatistic("提取结果: ", statistics);
  }
}
