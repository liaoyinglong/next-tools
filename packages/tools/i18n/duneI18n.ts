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
  navigatorMapper: [
    ["id-", LocalesEnum.id],
    ["en-", LocalesEnum.en],
    ["zh-", LocalesEnum.zh],
    ["lt-", LocalesEnum.lt],
  ],
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
    const loadedLocales = Object.keys(this.messageLoader);
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
  private messageLoader: Record<string, MsgLoader> = {};
  // 后续需要暴露给 浏览器插件读取，方便做反查翻译
  messageLoadResult: Record<string, BaseMsg> = {};
  register(locale: LocalesEnum, message: MsgLoader) {
    this.messageLoader[locale] = message;
  }

  /**
   * 外部可以直接调用，加载语言包
   * 这是一个同步方法
   */
  loadMessage(locale: string, message: BaseMsg[] | BaseMsg) {
    const messages = Array.isArray(message) ? message : [message];
    const { compiled, raw } = this.compileMessage(messages);
    this.messageLoadResult[locale] = raw;
    this.baseI18n.load(locale, compiled);
  }

  // 这里不能变成 async 方法，因为在 ssg 时，需要同步加载语言包
  private tryLoadMessage(
    locale: string,
    loader = this.messageLoader[locale]
  ): Promise<void> | void {
    if (!loader) {
      return;
    }
    // case: i18n.register(LocalesEnum.zh, [{},{}]);
    if (typeof loader === "object") {
      this.loadMessage(locale, loader);
      return;
    }

    const p = loader();
    if (!isAsyncMsg(p)) {
      // case: i18n.register(LocalesEnum.zh, () => [{},{}]);
      return this.tryLoadMessage(locale, p);
    }
    // case: i18n.register(LocalesEnum.zh, () => [Promise.resolve({})]);
    // case: i18n.register(LocalesEnum.zh, () => [import('./i18n.json')]);
    return Promise.allSettled(p).then((res) => {
      const loadSuccess = res.reduce((acc, v) => {
        if (v.status === "rejected") {
          console.error(`load ${locale} translate failed: `, v.reason);
          return acc;
        }
        return [...acc, v.value];
      }, [] as BaseMsg[]);
      return this.tryLoadMessage(locale, loadSuccess);
    });
  }

  /**
   * 将多个语言包合并成一个
   */
  private compileMessage(messages: BaseMsg[]) {
    const compiled: BaseMsg = {};
    const raw: BaseMsg = {};
    messages.forEach((msg) => {
      Object.keys(msg).forEach((k) => {
        const v = msg[k];
        raw[k] = v;
        if (typeof v === "string") {
          compiled[k] = compileMessage(v || k);
        }
      });
    });
    return { compiled, raw };
  }
  //#endregion
}

type BaseMsg = Record<string, any>;

type MsgLoader = BaseMsg[] | (() => Promise<BaseMsg>[] | BaseMsg[]);

const isAsyncMsg = (
  p: Promise<BaseMsg>[] | BaseMsg[]
): p is Promise<BaseMsg>[] => {
  let first = Array.isArray(p) ? p[0] : p;
  return typeof first?.then === "function";
};

export const i18n = new DuneI18n();
