import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, i18n, useLocale } from "../../src";

describe("useLocale", () => {
  // setup i18n
  const wrapper = (props: PropsWithChildren) => {
    return <I18nProvider>{props.children}</I18nProvider>;
  };
  i18n.load({
    [LocalesEnum.en]: {},
    [LocalesEnum.zh]: {},
  });
  i18n.activate(LocalesEnum.en);

  it("should return current locale", () => {
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
});
