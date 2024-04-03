import { useT } from "@dune2/tools/i18n";

export default async function () {
  const t = useT();
  const name = "world";

  await new Promise((resolve) => setTimeout(resolve, 1));

  return (
    <div>
      <h1>{t("hello")}</h1>
      <h2>{t(`hello {name}`, { name })}</h2>
    </div>
  );
}
