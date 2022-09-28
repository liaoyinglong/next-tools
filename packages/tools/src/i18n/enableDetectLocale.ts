import { i18n } from "@lingui/core";
import { detect, fromUrl, fromStorage } from "@lingui/detect-locale";
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
  //#region 启用语言方法重写
  const oldActivateLocale = i18n.activate;
  i18n.activate = (locale) => {
    // sync to localStorage
    localStorage.setItem(DetectLocaleEnum.storage, locale);
    oldActivateLocale.call(i18n, locale);
  };
  //#endregion

  let defaultLocale = detect(
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
