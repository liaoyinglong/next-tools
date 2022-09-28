import { i18n } from "@lingui/core";
import { detect, fromUrl, fromStorage } from "@lingui/detect-locale";
import { isServer } from "../shared";
import { DetectLocaleEnum, LocalesEnum } from "./enums";

interface Options {
  // 推导失败后的默认语言
  defaultLocale?: string;
}

/**
 * 语言推导
 * 优先使用 url 参数
 * 其次使用 localStorage
 */
export function enableDetectLocale(options: Options = {}) {
  options.defaultLocale ??= LocalesEnum.zh_CN;
  if (!isServer) {
    //#region 启用语言方法重写
    const oldActivateLocale = i18n.activate;
    i18n.activate = (locale) => {
      // sync to localStorage
      localStorage.setItem(DetectLocaleEnum.storage, locale);
      oldActivateLocale.call(i18n, locale);
    };
    //#endregion
  }
  // FIXME: ssg 时，不太能保证html和执行完成后的语言一致
  let defaultLocale = isServer
    ? options.defaultLocale
    : detect(
        fromStorage(DetectLocaleEnum.storage),
        fromUrl(DetectLocaleEnum.query)
      );
  if (
    !defaultLocale ||
    !Object.values(LocalesEnum).includes(defaultLocale as never)
  ) {
    defaultLocale = options.defaultLocale;
  }
  i18n.activate(defaultLocale);
}
