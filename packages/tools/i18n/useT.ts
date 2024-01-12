import { useLingui } from "@lingui/react";
import { t } from "./t";

/**
 * 这个hook主要是为了解决在`jsx`使用`t`方法的时候，语言切换了并没有重新渲染的问题
 */
export function useT() {
  useLingui();
  return t;
}
