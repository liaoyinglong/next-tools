import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import { I18nData } from "../shared/i18nData";
import { resolveSheetData } from "../shared/resolveSheetData";

const log = createLogger("generate");

export async function generate() {
  const config = await getConfig();
  let i = 0;
  for (const configItem of config.i18n ?? []) {
    i++;
    if (!configItem.sheetId || !configItem.sheetRange) {
      log.error(`config.${i} sheetId 或 sheetRange 为空，请检查`);
      continue;
    }
    const sheetData = await resolveSheetData(configItem);

    const statistics = await pMap(
      configItem.locales ?? [],
      async (locale, index) => {
        const i18nData = new I18nData(locale, configItem);
        await i18nData.updateFromSheetData(sheetData.getLangDataJSON(locale));
        await i18nData.saveToDisk();
        return await i18nData.statistic();
      }
    );
    I18nData.printStatistic(`${configItem.sheetRange} 生成结果: `, statistics);
  }
}
