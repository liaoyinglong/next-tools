import { I18nProvider, i18n } from "@dune2/i18n";

import { activate } from "lingui-example/i18n";
import "lingui-example/styles.css";
import { AppProps } from "next/app";
import { useEffect } from "react";

export default function Page({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Activate the default locale on page load
    activate("en");
  }, []);

  return (
    <I18nProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
