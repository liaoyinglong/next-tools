import { setupI18n } from "@lingui/core";
import {
  fromNavigator as fromNavigatorBase,
  fromPath,
  fromStorage,
  fromUrl,
} from "@lingui/detect-locale";
import type { EventEmitter } from "./EventEmitterType";

import { LocalesEnum } from "./enums";
import type { Config } from "./shared";

const isServer = typeof window === "undefined";

const defaultConfig: Config = {
  defaultLocale: LocalesEnum.en,
  detectFromPath: false,
  storageKey: "dune-lang",
  queryKey: "lang",
  supportedLocales: [],
  debug: false,
  navigatorMapper: [
    ["zh-", LocalesEnum.zh],
    ["id-", LocalesEnum.id],
    ["en-", LocalesEnum.en],
    ["lt-", LocalesEnum.lt],
    ["ru-", LocalesEnum.ru],
    ["ja-", LocalesEnum.ja],
    ["tr-", LocalesEnum.tr],
  ],
};

// 这个 i18n 是对 lingui/core 的封装
export class DuneI18n {
  baseI18n = setupI18n();

  initT() {
    return this.baseI18n.t.bind(this.baseI18n);
  }
  t = this.initT();
  on = this.baseI18n.on.bind(this.baseI18n) as EventEmitter["on"];
  emit = this.baseI18n.emit.bind(this.baseI18n) as EventEmitter["emit"];

  get locale() {
    return this.baseI18n.locale;
  }

  log(...args: any[]) {
    if (this.config.debug) {
      console.log(`[dune-i18n]: `, ...args);
    }
  }

  //#region 一些配置
  private config: Config = defaultConfig;
  updateConfig(config: Partial<Config>) {
    this.log("updateConfig ", config);
    this.config = { ...this.config, ...config };
    this.log("updateConfig result ", this.config);
  }
  // 主要给测试用例使用
  resetConfig() {
    this.config = defaultConfig;
    this.log("reset to defaultConfig ", this.config);
  }
  //#endregion

  //#region 支持的语言
  // 用户可以额外设置，同时也会从已加载的语言包中获取
  getSupportedLocales() {
    const loadedLocales = Object.keys(this.messageLoader);
    const r = this.config.supportedLocales.concat(loadedLocales);
    this.log("getSupportedLocales ", r);
    return r;
  }
  isSupportedLocale(locale: string) {
    const r = this.getSupportedLocales().includes(locale);
    this.log("isSupportedLocale ", locale, r);
    return r;
  }
  //#endregion

  //#region 推导语言
  detectLocale() {
    const { detectFromPath, storageKey, queryKey } = this.config;
    // 判断 传过来的语言 是否可用
    let defaultLocale = this.config.defaultLocale;

    if (!isServer) {
      const fromNavigator = () => {
        const browserLocale = fromNavigatorBase();
        const mappers = this.config.navigatorMapper;
        for (let i = 0; i < mappers.length; i++) {
          const [prefix, locale] = mappers[i];
          if (browserLocale.startsWith(prefix)) {
            return locale;
          }
        }
      };

      // fix: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
      const safeFromStorage = () => {
        try {
          return fromStorage(storageKey);
        } catch (e) {
          console.error("fromStorage error", e);
          return;
        }
      };
      let arr = [
        detectFromPath && fromPath(0, location),
        fromUrl(queryKey),
        safeFromStorage(),
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
    this.log("detectLocale ", defaultLocale);
    return defaultLocale;
  }
  //#endregion
  activate = async (
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
        },
  ) => {
    const opts = typeof locale !== "object" ? { locale } : locale;
    this.log("activate ", opts);

    const combinedLocale = opts.locale;
    const syncToStorage = opts.syncToStorage ?? true;

    // try load message
    // 需要兼容 同步和异步加载的语言
    // 原因是 同步的语言包不能再 下一个事件循环后再去激活语言
    // 不然会导致 ssr 时 无法同步获取到语言
    const loadPromise = this.tryLoadMessage(combinedLocale);
    if (typeof loadPromise?.then === "function") {
      await loadPromise;
    }

    this.baseI18n.activate(combinedLocale);
    this.emit("localeChange", combinedLocale);
    // 默认需要 同步到 localStorage
    if (syncToStorage) {
      //https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document/
      //fix: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
      try {
        localStorage.setItem(this.config.storageKey, combinedLocale);
      } catch (error) {
        console.error("set localStorage error", error);
      }
    }
  };

  //#region 注册语言包，并不一定会加载
  private messageLoader: Record<string, MsgLoader> = {};
  get messageLoadResult() {
    //@ts-expect-error 内部属性
    return this.baseI18n._messages;
  }
  register(locale: LocalesEnum, message: MsgLoader) {
    this.messageLoader[locale] = message;
    this.log("register ", locale, message);
  }

  /**
   * 外部可以直接调用，加载语言包
   * 这是一个同步方法
   */
  loadMessage(locale: string, message: BaseMsg) {
    this.baseI18n.load(locale, message);
  }

  // 这里不能变成 async 方法，因为在 ssg 时，需要同步加载语言包
  private tryLoadMessage(
    locale: string,
    loader = this.messageLoader[locale],
  ): Promise<void> | void {
    if (!loader) {
      return;
    }
    // case: i18n.register(LocalesEnum.zh, {});
    if (typeof loader === "object") {
      this.loadMessage(locale, loader);
      return;
    }
    // case: i18n.register(LocalesEnum.zh, () => import("./zh.json"));
    return loader().then((res) => {
      this.tryLoadMessage(locale, res);
    });
  }

  //#endregion
}

export type BaseMsg = Record<string, any>;

export type MsgLoader =
  | Record<string, unknown>
  | (() => Promise<Record<string, unknown>>);

export const i18n = new DuneI18n();

if (typeof window !== "undefined") {
  //@ts-ignore 暴露给浏览器插件使用
  window["__d_i18n"] = i18n;
}
