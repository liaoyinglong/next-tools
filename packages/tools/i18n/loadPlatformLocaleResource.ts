import { i18n } from "./duneI18n";

let controller: AbortController;

function initRequestUrl(url: string, projectName: string) {
  const urlObj = new URL(url);
  urlObj.searchParams.set("projectName", projectName);
  return urlObj.toString();
}

interface Opts {
  locale: string;
  projectName: string;
  url: string;
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
  try {
    const res = await fetch(url, {
      signal: controller.signal,
    }).then((res) => res.json());
    const item = res.data[locale];
    if (res.code !== 200 || !item) {
      console.error(`load ${locale} translate failed: `, res);
      return;
    }
    i18n.loadMessage(locale, item);
  } catch (e) {
    console.error(`load ${locale} translate error: `, e);
  }
}
