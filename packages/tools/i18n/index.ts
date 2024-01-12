import { Trans as TransRaw, type TransProps } from "@lingui/react";
import { type FC } from "react";
import { LocalesEnum } from "./enums";

export type { I18nContext, I18nProviderProps } from "@lingui/react";
export { I18nProvider } from "./I18nProvider";
export { i18n } from "./duneI18n";
export { loadPlatformLocaleResource } from "./loadPlatformLocaleResource";
export { msg } from "./msg";
export { t } from "./t";
export { useLocale } from "./useLocale";
export { useT } from "./useT";
export { LocalesEnum };

/**
 * @example
 * ```tsx
 * <Trans>Refresh inbox</Trans>;
 * <Trans>Attachment {name} saved.</Trans>;
 * <Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
 * ```
 */
export const Trans = TransRaw as FC<Partial<TransProps>>;
