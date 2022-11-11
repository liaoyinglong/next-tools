import { i18n } from "@lingui/core";
import {
  I18nProvider as I18nProviderRaw,
  I18nProviderProps,
} from "@lingui/react";
import { useEffect } from "react";
import { enableDetectLocale } from "./enableDetectLocale";

/**
 * Translates a template string using the global I18n instance
 * @example
 * ```
 * const message = t`Hello ${name}`;
 * ```
 */
export let t = initT();
function initT() {
  return i18n._.bind(i18n) as unknown as (
    literals: TemplateStringsArray | string,
    ...placeholders: any[]
  ) => string;
}
// 修复 更换语言的时候 t 没有重新生成，导致某些写在 useMemo 的 t 调用没有更新语言
i18n.on("change", () => {
  t = initT();
});

/**
 * 这里封装好了 传递给 Lingui 的 i18n 实例
 * 以及在组件挂载时自动开启语言检测
 */
export const I18nProvider = (props: Partial<I18nProviderProps>) => {
  useEffect(() => {
    enableDetectLocale();
  }, []);
  return (
    <I18nProviderRaw
      i18n={props.i18n ?? i18n}
      forceRenderOnLocaleChange={props.forceRenderOnLocaleChange ?? false}
    >
      {props.children}
    </I18nProviderRaw>
  );
};
