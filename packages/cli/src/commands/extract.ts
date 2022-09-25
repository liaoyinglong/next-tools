import fs from "fs-extra";
import { globby } from "globby";
import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import { I18nData, ExtractedMap } from "../shared/i18nData";

const log = createLogger("extract");

export async function extract() {
  const config = await getConfig();
  const files = await globby(
    [`**/**.{js,jsx,ts,tsx}`, "!**/node_modules/**", "!**.d.ts"],
    {
      cwd: config.cwd,
    }
  );
  log.info("预计共解析 %d 个文件", files.length);
  const { extract } = await import("@scope/wasm");
  const extractedI18nDataMap: ExtractedMap = new Map();
  await pMap(
    files,
    async (file) => {
      const content = await fs.readFile(file, "utf-8");
      const res: ExtractedMap = await extract(content);
      log.info("从 %s 中提取到 %s 条文案", file, res.size);
      res.forEach((value, key) => {
        const cur = extractedI18nDataMap.get(key);
        if (!cur?.defaults) {
          extractedI18nDataMap.set(key, value);
        }
      });
    },
    { concurrency: 20 }
  );
  log.info(
    "总统提取到 %d 条文案 %O",
    extractedI18nDataMap.size,
    extractedI18nDataMap
  );
  await pMap(["zh", "en", "cs"], async (locale, index) => {
    const i18nData = new I18nData(locale, extractedI18nDataMap);
    await i18nData.saveToDisk(index === 0);
  });
}
