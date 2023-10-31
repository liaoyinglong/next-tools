import { setupI18n } from "@lingui/core";
import {
  fromNavigator as fromNavigatorBase,
  fromPath,
  fromStorage,
  fromUrl,
} from "@lingui/detect-locale";
import { isServer } from "../shared";
import { compileMessage } from "./compile";
import { LocalesEnum } from "./enums";
import type { Config } from "./shared";

const defaultConfig: Config = {
  defaultLocale: LocalesEnum.en,
  detectFromPath: false,
  storageKey: "dune-lang",
  queryKey: "lang",
  supportedLocales: [],
};

// 这个 i18n 是对 lingui/core 的封装
export class DuneI18n {
  baseI18n = setupI18n();

  t = this.baseI18n.t.bind(this.baseI18n);
  on = this.baseI18n.on.bind(this.baseI18n);

  get locale() {
    return this.baseI18n.locale;
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
    const loadedLocales = Object.keys(this.registeredMessages);
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
        }
  ) => {
    const opts = typeof locale !== "object" ? { locale } : locale;

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
    // 默认需要 同步到 localStorage
    if (syncToStorage) {
      localStorage.setItem(this.config.storageKey, combinedLocale);
    }
  };

  //#region 注册语言包，并不一定会加载
  private registeredMessages: Record<string, Msg> = {};
  register(locale: LocalesEnum, message: Msg) {
    this.registeredMessages[locale] = message;
  }
  // 这里不能变成 async 方法，因为在 ssg 时，需要同步加载语言包
  private tryLoadMessage(locale: string) {
    const message = this.registeredMessages[locale];
    if (typeof message === "object") {
      this.baseI18n.load(locale, this.compileMessage(message));
      return;
    }
    return message()
      .then((r) => {
        this.baseI18n.load(locale, this.compileMessage(r));
      })
      .catch((error) => {
        this.baseI18n.load(locale, {});
        console.error(`load ${locale} translate failed: `, {
          error,
        });
      });
  }
  private compileMessage(msg: BaseMsg) {
    const obj: BaseMsg = {};
    Object.keys(msg).forEach((k) => {
      const v = msg[k];
      if (typeof v === "string") {
        obj[k] = compileMessage(v || k);
      }
    });
    return obj;
  }
  //#endregion
}

type BaseMsg = Record<string, any>;
type AsyncMsg = () => Promise<BaseMsg>;
type Msg = BaseMsg | AsyncMsg;

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
