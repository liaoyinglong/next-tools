import { act, renderHook } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, i18n, useLocale } from "../../src/i18n";
import { registerDefaultAsyncMessage, registerDefaultMessage } from "./shared";

describe("useLocale", () => {
  // setup i18n
  const wrapper = (props: PropsWithChildren) => {
    return (
      <I18nProvider enableDetectLocale={false}>{props.children}</I18nProvider>
    );
  };

  it("work with sync message loader", () => {
    registerDefaultMessage();
    i18n.activate(LocalesEnum.en);

    const { result } = renderHook(() => useLocale(), {
      wrapper,
    });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "activate": [Function],
        "isEn": true,
        "isID": false,
        "isLt": false,
        "isZH": false,
        "locale": "en",
      }
    `);

    // change locale
    act(() => {
      i18n.activate(LocalesEnum.zh);
    });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "activate": [Function],
        "isEn": false,
        "isID": false,
        "isLt": false,
        "isZH": true,
        "locale": "zh",
      }
    `);
  });

  it("work with async message loader", async () => {
    registerDefaultAsyncMessage();
    await i18n.activate(LocalesEnum.en);

    const { result } = renderHook(() => useLocale(), {
      wrapper,
    });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "activate": [Function],
        "isEn": true,
        "isID": false,
        "isLt": false,
        "isZH": false,
        "locale": "en",
      }
    `);

    // change locale
    await act(() => {
      return i18n.activate(LocalesEnum.zh);
    });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "activate": [Function],
        "isEn": false,
        "isID": false,
        "isLt": false,
        "isZH": true,
        "locale": "zh",
      }
    `);
  });
});
