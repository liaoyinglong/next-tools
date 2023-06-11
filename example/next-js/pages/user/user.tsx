import { Layout } from "lingui-example/components/Layout";

export default function Home() {
  const t = useT();
  const name = "12345678";
  t(`hello ${name}`);
  return (
    <Layout>
      <h1>
        <Trans id="example">Examples</Trans>
      </h1>

      <h2>
        <Trans id={`Plurals`}>Plurals</Trans>
      </h2>
    </Layout>
  );
}
