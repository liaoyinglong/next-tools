import { describe, expect, it } from "vitest";
import * as swc from "@swc/core";

let code = [
  "<Trans>Attachment  saved.</Trans>",
  "var name = Date.now()",
  "t`hello ${name}`",
  "<div>{t`hello ${name}`}</div>",
].join(";\n");

const transform = (source: string) => {
  return swc.transform(source, {
    filename: "input.jsx",
    jsc: {
      transform: {},
      parser: {
        syntax: "typescript",
        tsx: true,
      },
      experimental: {
        plugins: [[require.resolve("../"), {}]],
      },
    },
  });
};

describe("transform", () => {
  it("should transform correctly", async () => {
    const result = await transform(code);
    expect(result.code).toMatchInlineSnapshot(`
      "/*#__PURE__*/ React.createElement(Trans, {
          id: \\"Attachment saved.\\"
      });
      var name = Date.now();
      t(\\"hello {name}\\", {
          name: name
      });
      /*#__PURE__*/ React.createElement(\\"div\\", null, t(\\"hello {name}\\", {
          name: name
      }));
      "
    `);
  });
});
