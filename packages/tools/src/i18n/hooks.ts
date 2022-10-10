import { useLingui } from "@lingui/react";
import { LocalesEnum } from "./enums";
import { t } from "./shared";

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

/**
 * 这个hook主要是为了解决在`jsx`使用`t`方法的时候，语言切换了并没有重新渲染的问题
 */
export function useT() {
  useLingui();
  return t;
}
