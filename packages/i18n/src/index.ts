import { i18n } from "@lingui/core";

export { I18nProvider, Trans } from "@lingui/react";
export * from "@lingui/core";

export const t = i18n._.bind(i18n);
