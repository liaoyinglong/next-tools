import { i18n } from "@lingui/core";
import { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, t } from "../../src";
import { compileMessage } from "../../src/i18n/compile";

// setup i18n
const wrapper = (props: PropsWithChildren) => {
  return <I18nProvider>{props.children}</I18nProvider>;
};
const rawMessages = {
  [LocalesEnum.en]: {
    hello: "hello",
    "hello {name}": "hello {name}",
  },
  [LocalesEnum.zh]: {
    hello: "你好",
    "hello {name}": "你好 {name}",
  },
};

function compliedMessages(messages: typeof rawMessages) {
  let res: Record<string, any> = {};
  Object.keys(messages).forEach((locale) => {
    const data = messages[locale as keyof typeof messages];
    let obj: Record<string, any> = {};
    Object.keys(data).forEach((k) => {
      const v = data[k as keyof typeof data];
      obj[k] = compileMessage(v || k);
    });
    res[locale] = obj;
  });
  return res;
}

describe("i18n", () => {
  it("load message and activate success", () => {
    // TODO: 当前版本在加载的 语言包 是在编译时预编译好的
    // 这里需要模拟一下
    i18n.load(compliedMessages(rawMessages));
    i18n.activate(LocalesEnum.en);

    expect(i18n.t("hello")).toBe("hello");
    expect(i18n.t("hello {name}", { name: "world" })).toBe("hello world");

    i18n.activate(LocalesEnum.zh);
    expect(i18n.t("hello")).toBe("你好");
    expect(i18n.t("hello {name}", { name: "world" })).toBe("你好 world");
  });

  it("load message success", () => {
    // TODO: 当前版本在加载的 语言包 是在编译时预编译好的
    // 这里需要模拟一下
    i18n.load(compliedMessages(rawMessages));
    i18n.activate(LocalesEnum.en);

    expect(i18n.messages).toMatchInlineSnapshot(`
      {
        "hello": "hello",
        "hello {name}": [
          "hello ",
          [
            "name",
          ],
        ],
      }
    `);
  });

  it("t.ignoreExtract", () => {
    expect(t.ignoreExtract).toBe(t);
  });

  it("t.displayError", () => {
    expect(t.displayError(1)).toBe("error_1");
    expect(t.displayError("1")).toBe("error_1");
    expect(t.displayError({ code: 1 })).toBe("error_1");
    expect(t.displayError({ code: 1, message: "message" })).toBe("message");
  });
});
