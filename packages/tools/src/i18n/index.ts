import { TransProps, Trans as TransRaw } from "@lingui/react";
import { FC } from "react";
import { LocalesEnum } from "./enums";
export { useLingui } from "@lingui/react";
export type { I18nContext, I18nProviderProps } from "@lingui/react";
export { detectLocale } from "./detectLocale";
export { useLocale, useT } from "./hooks";
export { i18n } from "./i18n";
export { I18nProvider, t } from "./shared";
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
