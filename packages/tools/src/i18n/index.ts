import { i18n } from "@lingui/core";
import { TransProps, Trans as TransRaw } from "@lingui/react";
import { FC } from "react";
import { LocalesEnum } from "./enums";

export { useLingui } from "@lingui/react";
export type { I18nContext, I18nProviderProps } from "@lingui/react";
export { detectLocale } from "./detectLocale";
export { useLocale, useT } from "./hooks";
export { I18nProvider, t } from "./shared";
export { i18n, LocalesEnum };

/**
 * @example
 * ```tsx
 * <Trans>Refresh inbox</Trans>;
 * <Trans>Attachment {name} saved.</Trans>;
 * <Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
 * ```
 */
export const Trans = TransRaw as FC<Partial<TransProps>>;
