// this is rsc exports
// will import in rsc by next.js automatically
// see https://github.com/vercel/next.js/blob/944159a6d44b30194b45c5297be303dd20aee904/packages/next/webpack.config.js#L233

import type { TransProps } from "@lingui/react";
import { i18n } from "./duneI18n";

import { TransNoContext } from "@lingui/react/server";
import { t } from "./t";
export * from "./enums";
export { msg } from "./msg";
export { i18n, t };

/**
 * this use in rsc
 * @example
 * ```tsx
 * <Trans>Refresh inbox</Trans>;
 * <Trans>Attachment {name} saved.</Trans>;
 * <Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
 * ```
 */
export function Trans(props: TransProps) {
  return (
    <TransNoContext
      {...props}
      lingui={{
        i18n: i18n.baseI18n,
      }}
    />
  );
}
/**
 * this is use in rsc
 */
export function useT() {
  return t;
}
