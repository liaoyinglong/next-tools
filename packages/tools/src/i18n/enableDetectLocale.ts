import { i18n } from "@lingui/core";
import { detect, fromUrl, fromStorage } from "@lingui/detect-locale";
import { isServer, isBrowser } from "../shared";
import { DetectLocaleEnum, LocalesEnum } from "./enums";

interface Options {
  // 推导失败后的默认语言
  defaultLocale?: string;
}

/**
 * 语言推导
 * 优先使用 url 参数
 * 其次使用 localStorage
 *
 * @tips 最好在 useEffect 中调用，否则可能会导致 ssr 时，html 和执行完成后的语言不一致
 */
export function enableDetectLocale(options: Options = {}) {
  options.defaultLocale ??= LocalesEnum.zh_CN;
  if (isBrowser) {
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
