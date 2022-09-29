import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig, I18nConfig } from "../shared/config";
import { googleSheet } from "../shared/google/sheet";
import { I18nData } from "../shared/i18nData";
import { letterToNumber } from "../shared/letters";
import { resolveSheetData } from "../shared/resolveSheetData";

const log = createLogger("upload");

/**
 * 检测有本地有新增的key 则将新增的key更新到云端
 * 无则跳过
 */
async function batchUpdateKeys(config: I18nConfig) {
  let sheetData = await resolveSheetData(config);

  const allKeys: string[] = [];
  const i18nDataMap = new Map<string, I18nData>();
  await pMap(config.locales ?? [], async (locale) => {
    const i18nData = new I18nData(locale, config);
    i18nDataMap.set(locale, i18nData);
    const data = await i18nData.loadData();
    allKeys.push(...Object.keys(data));
  });

  let needSyncKeys = Array.from(new Set(allKeys)).filter((key) => {
    //  本地有新的key  服务器没有
    return !sheetData.keySet.has(key);
  });
  needSyncKeys = needSyncKeys.sort(config.keySorter);

  if (needSyncKeys.length) {
    log.info(`即将同步本地新增加 ${needSyncKeys.length} 个 i18nKey 到云端`);
    await googleSheet.updateColumn(
      config.sheetId!,
      config.sheetRange!,
      letterToNumber(config.position!.key),
      sheetData.nextAppendRowIndex,
      needSyncKeys
    );
    log.info("同步新增加i18nKey成功");

    // 批量同步新增的key的values到云端
    for (const lang of config.locales!) {
      const langFile = i18nDataMap.get(lang);
      const needSyncValues: string[] = [];
      needSyncKeys.forEach((k) => {
        if (langFile) {
          needSyncValues.push(langFile.data[k]);
        }
      });
      log.info(
        `即将同步本地 ${lang} 新增加 ${needSyncValues.length} 个值到云端`
      );
      await googleSheet.updateColumn(
        config.sheetId!,
        config.sheetRange!,
        letterToNumber(config.position![lang]),
        sheetData.nextAppendRowIndex,
        needSyncValues
      );
    }

    await sleep(1000);
    sheetData = await resolveSheetData(config);
    log.info(`已重新获取 ${config.sheetRange} 的数据`);
  }

  return { sheetData, i18nDataMap };
}
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function upload() {
  const config = await getConfig();

  for (const configItem of config.i18n ?? []) {
    const { sheetData, i18nDataMap } = await batchUpdateKeys(configItem);
    await pMap(configItem.locales ?? [], async (locale) => {
      const i18nData = i18nDataMap.get(locale)!;
      await i18nData.trySaveToGoogle(sheetData);
    });
  }

  log.info("上传成功");
}
