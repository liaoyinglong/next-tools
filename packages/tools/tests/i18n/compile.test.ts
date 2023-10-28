import { describe, expect, it } from "vitest";
import { compileMessage } from "../../i18n/compile";

describe("i18nResource.compile", () => {
  it("变量", function () {
    expect(compileMessage("Hello, {name}!")).toMatchInlineSnapshot(`
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
    expect(compileMessage("Hello, <0>{name}</0>!")).toMatchInlineSnapshot(`
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
    expect(compileMessage("hello")).toMatchInlineSnapshot(`"hello"`);
  });
});
