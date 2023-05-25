import beforeSwcLoader, {
  BeforeSwcLoaderOptions,
} from "../src/beforeSwcLoader";
import { describe, it, expect } from "vitest";

describe("beforeSwcLoader", () => {
  it("auto add use client", async () => {
    const res = await runWithContext(
      ``,
      {
        include: [/@mui\/material/],
        enableAutoUseClient: true,
      },
      "/node_modules/@mui/material/dist/index.esm.js"
    );
    expect(res).toMatchInlineSnapshot(`
      "'use client';
      "
    `);
  });

  it("atlaskit design-system", async function () {
    const res = await runWithContext(
      `/** @jsx jsx */`,
      {
        enableAutoUseClient: true,
        include: [/@atlaskit\/design-system/],
      },
      "/node_modules/@atlaskit/design-system/dist/index.esm.js"
    );
    expect(res).toMatchInlineSnapshot(`
      "'use client';
      /** @jsxRuntime classic */
      /** @jsx jsx */"
    `);
  });

  it("emotion css= ", async function () {
    const res = await runWithContext("<div css={css`width: 100px;`} />", {
      enabledEmotionCompatForAppRouter: true,
    });
    expect(res).toMatchInlineSnapshot(`
      "/** @jsxImportSource @emotion/react */
      'use client';
      <div css={css\`width: 100px;\`} />"
    `);
  });
  it("emotion styled ", async function () {
    const res = await runWithContext("const Widget = styled.div``", {
      enabledEmotionCompatForAppRouter: true,
    });
    expect(res).toMatchInlineSnapshot(`
      "/** @jsxImportSource @emotion/react */
      'use client';
      const Widget = styled.div\`\`"
    `);
  });
  it("useT()", async function () {
    const res = await runWithContext(`const App = () => { const t = useT();}`, {
      enabledI18nCompat: true,
    });
    expect(res).toMatchInlineSnapshot(`
      "'use client';
      const App = () => { const t = useT();}"
    `);
  });
});

function runWithContext(
  source: string,
  options: BeforeSwcLoaderOptions = {},
  resourcePath = "/src/app.tsx"
) {
  return new Promise((resolve, reject) => {
    const loaderContext = {
      resourcePath,
      async() {
        return (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        };
      },
      getOptions() {
        return options;
      },
    };
    beforeSwcLoader.call(loaderContext, source);
  });
}
