import { i18n } from "./duneI18n";

type Data = Record<string, Record<string, string>>;

let cache = {
  time: 0,
  data: {} as Data,
  dataPromise: null as Promise<Data | void> | null,
};

async function initFetch(opts: Opts): Promise<Data | void> {
  const urlObj = new URL(opts.url);
  urlObj.searchParams.set("projectName", opts.projectName);
  try {
    const res = await fetch(urlObj.toString()).then((res) => res.json());
    if (res.code !== 200) {
      console.error(`load translate failed: `, res);
      return;
    }
    return res.data;
  } catch (e) {
    console.error(`load translate error: `, e);
    return;
  }
}

interface Opts {
  /**
   * 语言
   */
  locale: string;
  /**
   * 项目名称
   */
  projectName: string;
  /**
   * 翻译平台地址接口地址
   */
  url: string;
  /**
   * 缓存时间 5s
   * @default 5 * 1000
   */
  cacheTime?: number;
}

/**
 * 从翻译平台加载翻译资源
 */
export async function loadPlatformLocaleResource(opts: Opts) {
  const locale = opts.locale;
  const now = Date.now();
  const cacheTime = opts.cacheTime || 5 * 1000;

  // 有缓存且未过期
  if (cache.data[locale] && now - cache.time < cacheTime) {
    i18n.loadMessage(locale, cache.data[locale]);
    return;
  }

  if (!cache.dataPromise) {
    cache.dataPromise = initFetch(opts);
  }
  const data = await cache.dataPromise;
  // 用完后需要清空，否则会一直缓存
  cache.dataPromise = null;
  if (data) {
    cache.data = data;
    cache.time = Date.now();
    i18n.loadMessage(locale, data[locale]);
  }
}
