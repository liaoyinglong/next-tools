import { i18n } from "@lingui/core";
import {
  detect,
  fromUrl,
  fromStorage,
  fromNavigator,
} from "@lingui/detect-locale";
import { isServer, isBrowser } from "../shared";
import { LocalesEnum } from "./enums";

interface Options {
  // 推导失败后的默认语言
  defaultLocale?: string;
  /**
   * 存储的 key
   * @default dune-lang
   */
  storageKey?: string;

  /**
   * url 参数
   * @default lang
   */
  queryKey?: string;
}

/**
 * 语言推导
 * 从 navigator 中获取语言
 * 优先使用 url 参数
 * 其次使用 localStorage
 *
 * @tips 最好在 useEffect 中调用，否则可能会导致 ssr 时，html 和执行完成后的语言不一致
 */
export function enableDetectLocale(options: Options = {}) {
  const storageKey = options.storageKey ?? "dune-lang";
  const queryKey = options.queryKey ?? "lang";

  if (isBrowser) {
    //#region 启用语言方法重写
    const oldActivateLocale = i18n.activate;
    i18n.activate = (locale) => {
      // sync to localStorage
      localStorage.setItem(storageKey, locale);
      oldActivateLocale.call(i18n, locale);
    };
    //#endregion

    //#region 获取浏览器语言
    if (!options.defaultLocale) {
      const browserLocale = fromNavigator();
      const mappers = [
        ["id-", LocalesEnum.id],
        ["en-", LocalesEnum.en],
      ];
      for (let i = 0; i < mappers.length; i++) {
        const [prefix, locale] = mappers[i];
        if (browserLocale.startsWith(prefix)) {
          options.defaultLocale = locale;
          break;
        }
      }
    }
    //#endregion
  }
  options.defaultLocale ??= LocalesEnum.en;

  let defaultLocale = isServer
    ? options.defaultLocale
    : detect(fromStorage(storageKey), fromUrl(queryKey));
  if (
    !defaultLocale ||
    !Object.values(LocalesEnum).includes(defaultLocale as never)
  ) {
    defaultLocale = options.defaultLocale;
  }
  i18n.activate(defaultLocale);
}
