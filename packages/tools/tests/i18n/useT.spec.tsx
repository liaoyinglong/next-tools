import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, i18n, t, useT } from "../../i18n";

const enMessage = {
  hello: "hello",
  "hello {name}": "hello {name}",
  error_221040: "Nama variabel sudah ada: {0}",
  error_221041: "Variabel belum didefinisikan: {0}",
};
const zhMessage = {
  hello: "你好",
  "hello {name}": "你好 {name}",
  error_221040: "变量名已存在: {0}",
  error_221041: "未定义的变量: {0}",
};

describe("useT", () => {
  // setup i18n
  const wrapper = (props: PropsWithChildren) => {
    return (
      <I18nProvider enableDetectLocale={false}>{props.children}</I18nProvider>
    );
  };

  it("work with sync message loader", () => {
    i18n.register(LocalesEnum.en, [enMessage]);
    i18n.register(LocalesEnum.zh, [zhMessage]);
    i18n.activate(LocalesEnum.en);

    const { result } = renderHook(
      () => {
        const t = useT();
        return {
          simple: t("hello"),
          variable: t("hello {name}", { name: "world" }),
        };
      },
      { wrapper }
    );
    expect(result.current).toMatchInlineSnapshot(`
      {
        "simple": "hello",
        "variable": "hello world",
      }
    `);

    // change locale
    act(() => {
      i18n.activate(LocalesEnum.zh);
    });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "simple": "你好",
        "variable": "你好 world",
      }
    `);
  });

  it("work with async message loader", async () => {
    i18n.register(LocalesEnum.en, () => [Promise.resolve(enMessage)]);
    i18n.register(LocalesEnum.zh, () => [Promise.resolve(zhMessage)]);
    await i18n.activate(LocalesEnum.en);

    const { result } = renderHook(
      () => {
        const t = useT();
        return {
          simple: t("hello"),
          variable: t("hello {name}", { name: "world" }),
        };
      },
      { wrapper }
    );
    expect(result.current).toMatchInlineSnapshot(`
      {
        "simple": "hello",
        "variable": "hello world",
      }
    `);

    // change locale
    await act(() => {
      return i18n.activate(LocalesEnum.zh);
    });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "simple": "你好",
        "variable": "你好 world",
      }
    `);
  });

  it("t.ignoreExtract", () => {
    expect(t.ignoreExtract).toBe(t);
  });

  it("t.displayError", () => {
    i18n.register(LocalesEnum.zh, [zhMessage]);
    i18n.activate(LocalesEnum.zh);
    expect(t.displayError(1)).toBe("error_1");
    expect(t.displayError("1")).toBe("error_1");
    expect(t.displayError({ code: 1 })).toBe("error_1");
    expect(t.displayError({ code: 1, message: "message" })).toBe("message");

    expect(
      t.displayError({
        code: `221040`,
        message: "message",
        errorVars: { "0": "abc" },
      })
    ).toBe("变量名已存在: abc");
    expect(
      t.displayError({
        code: `221041`,
        message: "message",
        errorVars: { "0": "abc" },
      })
    ).toBe("未定义的变量: abc");
    expect(
      t.displayError({
        code: `221041`,
        message: "message",
        // @ts-expect-error 也是支持数组的
        errorVars: ["abc"],
      })
    ).toBe("未定义的变量: abc");
  });
});
