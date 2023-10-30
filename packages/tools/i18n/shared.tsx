import { MessageDescriptor, MessageOptions } from "@lingui/core";
import { I18nProvider as I18nProviderRaw } from "@lingui/react";
import { PropsWithChildren, useEffect } from "react";
import { i18n } from "./duneI18n";
import { LocalesEnum } from "./enums";

/**
 * Translates a template string using the global I18n instance
 * @example
 * ```
 * const message = t`Hello ${name}`;
 * ```
 */
export let t = initT();
interface TFunction {
  (
    id: string,
    values?: Record<string, unknown>,
    options?: MessageOptions
  ): string;
  (descriptor: MessageDescriptor): string;
  (literals: TemplateStringsArray, ...placeholders: any[]): string;

  /**
   * 使用这个方法将被cli不会提取出来翻译
   * 一般用在key是后端返回的动态情况
   * 但是这种情况下需要开发者手动将翻译填入翻译文件中
   */
  ignoreExtract: TFunction;

  /**
   * 翻译后端错误信息
   *
   * 传入错误码，会补齐 `error_` 前缀
   * 传入对象，会使用对象的 code 字段去翻译, 如果没有对应的文案，则使用 message 字段返回
   */
  displayError: (
    arg: number | string | { code?: string | number; message?: string | number }
  ) => string;
}

function initT() {
  let t = i18n.t as unknown as TFunction;
  t.ignoreExtract = t;
  t.displayError = (arg) => {
    let normalizedArg = typeof arg === "object" ? arg : { code: arg };

    let key = `error_${normalizedArg.code}`;
    const translated = t(key);
    // 如果没有对应的文案，则使用 message 字段返回
    if (translated === key && !!normalizedArg.message) {
      return normalizedArg.message + "";
    }
    return translated;
  };
  return t;
}
// 修复 更换语言的时候 t 没有重新生成，导致某些写在 useMemo 的 t 调用没有更新语言
i18n.on("change", () => {
  t = initT();
});

interface I18nProviderPropsCustom {
  enableDetectLocale?: boolean;
}

/**
 * 这里封装好了 传递给 Lingui 的 i18n 实例
 * 以及在组件挂载时自动开启语言检测
 */
export const I18nProvider = (
  props: PropsWithChildren<I18nProviderPropsCustom>
) => {
  const { enableDetectLocale = true } = props;
  useEffect(() => {
    if (enableDetectLocale) {
      i18n.activate(i18n.detectLocale());
    }
  }, [enableDetectLocale]);

  return (
    <I18nProviderRaw i18n={i18n.baseI18n}>{props.children}</I18nProviderRaw>
  );
};

//#region msg fn
interface MsgFn {
  (descriptor: MessageDescriptor): string;
  (id: string): string;
  (literals: TemplateStringsArray): string;
}

/**
 * @see https://lingui.dev/tutorials/react-patterns#lazy-translations
 * 标记需要提取的 i18n 字符串（用于提取翻译），主要给编译器用的
 * 一般用在以下场景：
 * 在组件外声明 options 需要翻译，组件外没有 t 函数
 * @example
 * ```jsx
 * const favoriteColors = [msg`Red`, msg`Orange`, msg`Yellow`, msg`Green`];
 * export default function ColorList() {
 *   const t = useT()
 *   return (
 *     <ul>
 *       {favoriteColors.map((color) => (
 *         <li>
 *           {t.ignoreExtract(color)}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export const msg: MsgFn = (...args: any[]) => {
  if (process.env.NODE_ENV !== "development") {
    if (args.length > 1) {
      throw new Error("msg函数只能接受字符串常量");
    }
  }
  return args[0];
};

//#endregion

export interface Config {
  // 推导失败后的默认语言
  defaultLocale: LocalesEnum;
  /**
   * 存储的 key
   * @default dune-lang
   */
  storageKey: string;

  /**
   * url 参数
   * @default lang
   */
  queryKey: string;

  /**
   * 是否从 url 中获取语言 默认为 false
   * 在后管系统中，一般不需要
   */
  detectFromPath: boolean;

  /**
   * 用户可以额外设置，同时也会从已加载的语言包中获取
   */
  supportedLocales: string[];
}
