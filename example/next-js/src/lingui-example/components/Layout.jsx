import Head from "next/head";

import { activate } from "lingui-example/i18n";
import styles from "./Layout.module.css";

export function Layout({ title = null, className = "", children }) {
  const t = useT();
  // Default props can't be translated at module level because active locale
  // isn't known when module is imported, but rather when component
  // is rendered.
  if (title == null) {
    title = t`Example project using LinguiJS`;
    console.log(t`what is this?`);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${styles.main} ${className || ''}`}>{children}</main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans>
            Powered by
            <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
          </Trans>
        </a>
        &nbsp;{" | "}
        <button className={styles.link} onClick={() => activate("en")}>
          English
        </button>
        {" | "}
        <button className={styles.link} onClick={() => activate("in")}>
          Česky
        </button>
      </footer>
    </div>
  );
}
