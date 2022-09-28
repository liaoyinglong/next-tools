import { I18nProvider, i18n, enableDetectLocale } from "@dune2/tools";
import "lingui-example/styles.css";
import { AppProps } from "next/app";

enableDetectLocale();

export default function Page({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
