import { act, renderHook } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, i18n, useLocale } from "../../i18n";

describe("useLocale", () => {
  // setup i18n
  const wrapper = (props: PropsWithChildren) => {
    return (
      <I18nProvider enableDetectLocale={false}>{props.children}</I18nProvider>
    );
  };

  it("work with sync message loader", () => {
    i18n.register(LocalesEnum.en, [{}]);
    i18n.register(LocalesEnum.zh, [{}]);
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
    i18n.register(LocalesEnum.en, () => [Promise.resolve({})]);
    i18n.register(LocalesEnum.zh, () => [Promise.resolve({})]);
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
