import { i18n as baseI18n } from "@lingui/core";
import { LocalesEnum } from "./enums";

//#region 重写 i18n 方法
type RawI18n = typeof baseI18n;
type ExtraConfig = {
  /**
   * 是否同步到 localStorage
   * 在 ssg 第一次激活选中语言时，需要设置为 false，否则导致水合告警
   * @default true
   */
  syncToStorage?: boolean;
};

// activate 方法重写 具体实现在 detectLocale.ts 中
export const i18n = baseI18n as Omit<RawI18n, "activate"> & {
  activate: (
    locale: LocalesEnum,
    locales?: LocalesEnum[],
    config?: ExtraConfig
  ) => void;
};
//#endregion
