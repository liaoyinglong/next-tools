import { Layout } from "lingui-example/components/Layout";

export default function Home() {
  t(`hello ${name}`);
  return (
    <Layout>
      <h1>
        <Trans>Examples</Trans>
      </h1>

      <h2>
        <Trans>Plurals</Trans>
      </h2>
    </Layout>
  );
}
