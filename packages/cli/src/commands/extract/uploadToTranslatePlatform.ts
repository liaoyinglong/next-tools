import axios from "axios";
import https from "https";
import pc from "picocolors";
import { createLogger } from "../../shared";
import { I18nConfig } from "../../shared/config";
import { I18nData } from "../../shared/i18nData";
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const log = createLogger("uploadToPlatform");

export async function uploadToTranslatePlatform(
  config: I18nConfig,
  i18nDataArr: I18nData[]
) {
  const { translatePlatform, defaultLocale } = config;

  if (translatePlatform?.url && translatePlatform?.project) {
    log.info(pc.bold("开始上传至翻译平台"));
    const defaultII18nData = i18nDataArr.find(
      (item) => item.locale === defaultLocale
    );
    if (!defaultII18nData) {
      log.error("没有找到默认语言的翻译文件 %s", defaultLocale);
      return;
    }
    try {
      // 调用 translatePlatform 的接口
      const res = await axios({
        method: "post",
        baseURL: translatePlatform.url,
        url: `/v1/dune-i18n/public/uploadTranslateData`,
        data: {
          localeCode: defaultLocale,
          translateData: defaultII18nData.data,
          projectName: translatePlatform.project,
        },
        httpsAgent: agent,
      });
      log.info("上传结果: %o", res.data);
    } catch (e) {
      log.error("上传失败 %s %s", e.message, e.code);
    }
  }
}
