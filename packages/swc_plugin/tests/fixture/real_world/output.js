import { Layout } from "lingui-example/components/Layout";
export default function Home() {
    const name = "Home";
    return <Layout className={styles.main}>

            {t("Welcome to {name}!", {
        name: name
    })}

            <Trans id="Welcome to <0>LinguiJS!</0>" components={{
        0: <a href="https://lingui.js.org">LinguiJS!</a>
    }}></Trans>

        </Layout>;
}
