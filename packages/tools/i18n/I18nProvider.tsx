import { I18nProvider as I18nProviderRaw } from "@lingui/react";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { i18n } from "./duneI18n";

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
