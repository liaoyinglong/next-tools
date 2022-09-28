import { useLingui } from "@lingui/react";
import { LocalesEnum } from "./enums";

/**
 * 获取当前的 语言 相关信息
 */
export function useLocale() {
  const { i18n } = useLingui();

  return {
    locale: i18n.locale,
    isZhCN: i18n.locale === LocalesEnum.zh_CN,
    isInID: i18n.locale === LocalesEnum.in_ID,
  };
}
