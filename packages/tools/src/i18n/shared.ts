import { i18n } from "@lingui/core";

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
