import { I18n as BaseI18n } from "@lingui/core";
import {
  fromNavigator as fromNavigatorBase,
  fromPath,
  fromStorage,
  fromUrl,
} from "@lingui/detect-locale";
import { isServer } from "../src/shared";
import { LocalesEnum } from "./enums";
import { Config } from "./shared";

const defaultConfig: Config = {
  defaultLocale: LocalesEnum.en,
  detectFromPath: false,
  storageKey: "dune-lang",
  queryKey: "lang",
  supportedLocales: [],
};

export class DuneI18n extends BaseI18n {
  constructor() {
    super({});
  }

  //#region 一些配置
  private config: Config = defaultConfig;
  updateConfig(config: Partial<Config>) {
    this.config = { ...this.config, ...config };
  }
  // 主要给测试用例使用
  resetConfig() {
    this.config = defaultConfig;
  }
  //#endregion

  //#region 支持的语言
  // 用户可以额外设置，同时也会从已加载的语言包中获取
  getSupportedLocales() {
    // @ts-expect-error 这是私有属性，获取已经加载了哪些 语言
    const loadedLocales = Object.keys(this._messages);
    return this.config.supportedLocales.concat(loadedLocales);
  }
  isSupportedLocale(locale: string) {
    return this.getSupportedLocales().includes(locale);
  }
  //#endregion

  //#region 推导语言
  detectLocale() {
    const { detectFromPath, storageKey, queryKey } = this.config;
    // 判断 传过来的语言 是否可用
    let defaultLocale = this.config.defaultLocale;

    if (!isServer) {
      let arr = [
        detectFromPath && fromPath(0, location),
        fromUrl(queryKey),
        fromStorage(storageKey),
        fromNavigator(),
      ];
      for (let i = 0; i < arr.length; i++) {
        const locale = arr[i];
        if (locale && this.isSupportedLocale(locale)) {
          defaultLocale = locale as LocalesEnum;
          break;
        }
      }
    }
    return defaultLocale;
  }
  //#endregion

  activate(
    locale:
      | string
      | {
          /**
           * 是否同步到 localStorage
           * 在 ssg 第一次激活选中语言时，需要设置为 false，否则导致水合告警
           * @default true
           */
          syncToStorage?: boolean;
          locale: string;
        }
  ) {
    const opts = typeof locale !== "object" ? { locale } : locale;

    const combinedLocale = opts.locale;
    const syncToStorage = opts.syncToStorage ?? true;

    super.activate(combinedLocale);

    // 默认需要 同步到 localStorage
    if (syncToStorage) {
      localStorage.setItem(this.config.storageKey, combinedLocale);
    }
  }
}

export const i18n = new DuneI18n();

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
