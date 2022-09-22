import { Layout } from "lingui-example/components/Layout";
import styles from "./index.module.css";

export default function Home() {
    const name = "Home";
    return (
        <Layout className={styles.main}>
            {t`Welcome to ${name}!`}
            <Trans>
                Welcome to <a href="https://lingui.js.org">LinguiJS!</a>
            </Trans>
        </Layout>
    );
}
