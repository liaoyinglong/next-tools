import { I18nProvider, i18n } from "@scope/i18n";

import { activate } from "lingui-example/i18n";
import "lingui-example/styles.css";
import { useEffect } from "react";

export default function Page({ Component, pageProps }) {
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
