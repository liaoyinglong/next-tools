import { i18n } from "@lingui/core";
import { TransProps, Trans as TransRaw } from "@lingui/react";
import { FC } from "react";

export { I18nProvider } from "@lingui/react";
export * from "@lingui/core";

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
