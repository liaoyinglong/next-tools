import { i18n } from "@lingui/core";
import { TransProps, Trans as TransRaw } from "@lingui/react";
import { FC } from "react";
import { LocalesEnum } from "./enums";

export { enableDetectLocale } from "./enableDetectLocale";
export * from "./hooks";

export { I18nProvider, useLingui, withI18n } from "@lingui/react";
export type {
  I18nProviderProps,
  I18nContext,
  withI18nProps,
} from "@lingui/react";
export { i18n, LocalesEnum };

const defaultPlurals = () => "";
Object.values(LocalesEnum).forEach((locale) => {
  i18n.loadLocaleData(locale, { plurals: defaultPlurals });
});

/**
 * Translates a template string using the global I18n instance
 * @example
 * ```
 * const message = t`Hello ${name}`;
 * ```
 */
export const t = i18n._.bind(i18n) as unknown as (
  literals: TemplateStringsArray,
  ...placeholders: any[]
) => string;

/**
 * @example
 * ```tsx
 * <Trans>Refresh inbox</Trans>;
 * <Trans>Attachment {name} saved.</Trans>;
 * <Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
 * ```
 */
export const Trans = TransRaw as FC<Partial<TransProps>>;
