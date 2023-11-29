import axios from "axios";
import pMap from "p-map";
import { createLogger } from "../shared";
import { getConfig } from "../shared/config";
import { I18nData } from "../shared/i18nData";

const logger = createLogger("downloadFromPlatform");

/**
 * 从 翻译平台下载翻译文件
 */
export async function downloadFromPlatform() {
  const config = await getConfig();
  // 只有配置了 translatePlatform 才会下载
  // TODO: 暂时只支持一个，后续支持多个
  const i18nConfig = config.i18n?.[0];
  if (!i18nConfig) {
    logger.error("i18n 配置为空");
    return;
  }
  const { translatePlatform, locales } = i18nConfig;
  if (!translatePlatform?.enable) {
    logger.info("translatePlatform.enable 为 false，不会下载");
    return;
  }
  const res = await axios({
    baseURL: translatePlatform.url,
    url: "/v1/dune-i18n/public/findAll",
    params: {
      projectName: translatePlatform.project,
    },
  }).catch((err) => {
    throw new TransError(err, "请求翻译平台失败");
  });

  const data = res.data.data;
  if (!data) {
    throw new TransError(res.data, "data 为空");
  }

  await pMap(locales ?? [], async (locale) => {
    const i18nData = new I18nData(locale, i18nConfig);
    await i18nData.updateFromSheetData(data?.[locale] ?? {});
    await i18nData.saveToDisk();
    return i18nData;
  });
}

class TransError extends Error {
  constructor(public data: any, message: string = "") {
    super(`获取翻译平台数据失败: ${message}`);
  }
}
