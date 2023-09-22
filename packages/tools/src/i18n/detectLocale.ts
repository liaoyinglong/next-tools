import {
  fromNavigator as fromNavigatorBase,
  fromPath,
  fromStorage,
  fromUrl,
} from "@lingui/detect-locale";
import { isBrowser, isServer } from "../shared";
import { LocalesEnum } from "./enums";
import { i18n } from "./i18n";

export interface DetectLocaleOptions {
  // 推导失败后的默认语言
  defaultLocale?: LocalesEnum;
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

  /**
   * 是否从 url 中获取语言 默认为 false
   * 在后管系统中，一般不需要
   */
  detectFromPath?: boolean;
}

/**
 * 语言推导
 * 从 navigator 中获取语言
 * 优先使用 url 参数
 * 其次使用 localStorage
 *
 * @tips 最好在 useEffect 中调用，否则可能会导致 ssr 时，html 和执行完成后的语言不一致
 */
export function detectLocale(options: DetectLocaleOptions = {}) {
  const {
    detectFromPath = false,
    storageKey = "dune-lang",
    queryKey = "lang",
  } = options;

  if (isBrowser) {
    //#region 启用语言方法重写
    const oldActivateLocale = i18n.activate;

    // 重写方法，添加了第三个参数
    i18n.activate = (locale, locales, opts = {}) => {
      const { syncToStorage = true } = opts;
      if (syncToStorage) {
        // sync to localStorage
        localStorage.setItem(storageKey, locale);
      }
      oldActivateLocale.call(i18n, locale, locales);
    };
    //#endregion
  }
  // 判断 传过来的语言 是否可用
  let defaultLocale = options.defaultLocale;

  if (!isServer) {
    let arr = [
      detectFromPath && fromPath(0, location),
      fromUrl(queryKey),
      fromStorage(storageKey),
      fromNavigator(),
    ];
    for (let i = 0; i < arr.length; i++) {
      const locale = arr[i];
      if (isAvailableLocale(locale)) {
        defaultLocale = locale;
        break;
      }
    }
  }
  i18n.activate(defaultLocale!);
  return defaultLocale;
}

// 判断是否可用的语言
function isAvailableLocale(locale: unknown): locale is LocalesEnum {
  // @ts-expect-error 这是一个私有属性
  const locales = Object.keys(i18n._messages);
  return locales.includes(locale as never);
}

function fromNavigator() {
  const browserLocale = fromNavigatorBase();
  const mappers = [
    ["id-", LocalesEnum.id],
    ["en-", LocalesEnum.en],
    ["zh-", LocalesEnum.zh],
    ["lt-", LocalesEnum.lt],
  ];
  for (let i = 0; i < mappers.length; i++) {
    const [prefix, locale] = mappers[i];
    if (browserLocale.startsWith(prefix)) {
      return locale;
    }
  }
}
