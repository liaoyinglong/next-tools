import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, i18n, useT } from "../../i18n";

const enMessage = {
  hello: "hello",
  "hello {name}": "hello {name}",
};
const zhMessage = {
  hello: "你好",
  "hello {name}": "你好 {name}",
};

afterEach(() => {
  i18n.registeredMessages = {};
});

describe("useT", () => {
  // setup i18n
  const wrapper = (props: PropsWithChildren) => {
    return (
      <I18nProvider enableDetectLocale={false}>{props.children}</I18nProvider>
    );
  };

  it("work with sync message loader", () => {
    i18n.register(LocalesEnum.en, enMessage);
    i18n.register(LocalesEnum.zh, zhMessage);
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
    i18n.register(LocalesEnum.en, () => Promise.resolve(enMessage));
    i18n.register(LocalesEnum.zh, () => Promise.resolve(zhMessage));
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
});
