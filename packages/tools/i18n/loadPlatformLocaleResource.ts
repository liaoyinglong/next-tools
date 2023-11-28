import { i18n } from "./duneI18n";

let controller: AbortController;
let cache = {
  time: 0,
  data: {} as Record<string, Record<string, string>>,
};

function initRequestUrl(url: string, projectName: string) {
  const urlObj = new URL(url);
  urlObj.searchParams.set("projectName", projectName);
  return urlObj.toString();
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
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const url = initRequestUrl(opts.url, opts.projectName);
  const locale = opts.locale;
  const now = Date.now();
  const cacheTime = opts.cacheTime || 5 * 1000;

  // 有缓存且未过期
  if (cache.data[locale] && now - cache.time < cacheTime) {
    i18n.loadMessage(locale, cache.data[locale]);
    return;
  }

  try {
    const res = await fetch(url, {
      signal: controller.signal,
    }).then((res) => res.json());
    const item = res.data[locale];
    if (res.code !== 200 || !item) {
      console.error(`load ${locale} translate failed: `, res);
      return;
    }

    cache.data = res.data;
    cache.time = Date.now();

    i18n.loadMessage(locale, item);
  } catch (e) {
    console.error(`load ${locale} translate error: `, e);
  }
}
