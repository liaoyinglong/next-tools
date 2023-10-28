import { describe, expect, it } from "vitest";
import compile from "./compile";

describe("i18nResource.compile", () => {
  it("变量", function () {
    expect(compile("Hello, {name}!")).toMatchInlineSnapshot(`
      [
        "Hello, ",
        [
          "name",
        ],
        "!",
      ]
    `);
  });

  it("组件", () => {
    expect(compile("Hello, <0>{name}</0>!")).toMatchInlineSnapshot(`
      [
        "Hello, <0>",
        [
          "name",
        ],
        "</0>!",
      ]
    `);
  });

  it("不需要转换的", function () {
    expect(compile("hello")).toMatchInlineSnapshot(`"hello"`);
  });
});
