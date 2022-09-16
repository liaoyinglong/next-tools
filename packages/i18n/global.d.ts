import { TransProps } from "@lingui/react";
import { FC } from "react";

declare global {
  /**
   * Translates a template string using the global I18n instance
   * it can automatically import by this swc plugin
   * @example
   * ```
   * const message = t`Hello ${name}`;
   * ```
   */
  const t: (literals: TemplateStringsArray, ...placeholders: any[]) => string;
  /**
   * it can automatically import by this swc plugin
   * @example
   * ```tsx
   * <Trans>Refresh inbox</Trans>;
   * <Trans>Attachment {name} saved.</Trans>;
   * <Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
   * ```
   */
  const Trans: FC<Partial<TransProps>>;
}
