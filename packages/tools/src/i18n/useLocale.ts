import { useLingui } from "@lingui/react";
import { i18n as globalI18n } from "./duneI18n";
import { LocalesEnum } from "./enums";

/**
 * 获取当前的 语言 相关信息
 */
export function useLocale() {
  const { i18n } = useLingui();

  return {
    locale: i18n.locale,
    isZH: i18n.locale === LocalesEnum.zh,
    isID: i18n.locale === LocalesEnum.id,
    isEn: i18n.locale === LocalesEnum.en,
    isLt: i18n.locale === LocalesEnum.lt,
    activate: globalI18n.activate,
  };
}
