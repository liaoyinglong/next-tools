import { LocalesEnum } from "@dune2/tools/i18n";
import { PropsWithChildren } from "react";
import { i18n } from "../../i18n";

interface Params {
  locale: LocalesEnum;
}

// this layout must be server component
// it must run i18n.activate once on server side for ssg export
export default function Layout(
  props: PropsWithChildren<{
    params: Params;
  }>,
) {
  if (i18n.isSupportedLocale(props.params.locale)) {
    i18n.activate({
      locale: props.params.locale,
      syncToStorage: false,
    });
  }
  return props.children;
}
export function generateStaticParams() {
  const locales = i18n.getSupportedLocales();
  return locales.map((locale) => ({ locale }));
}
