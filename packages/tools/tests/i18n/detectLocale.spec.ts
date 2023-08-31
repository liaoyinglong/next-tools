import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalesEnum, i18n } from "../../src/i18n";
import { detectLocale } from "../../src/i18n/detectLocale";

i18n.load({
  [LocalesEnum.zh]: {},
  [LocalesEnum.en]: {},
  [LocalesEnum.id]: {},
});

function updateLocation(pathname: string, query: Record<string, any> = {}) {
  localStorage.clear();
  let url = new URL(pathname, "https://example.com");
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  location.href = url.toString();
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("detectLocale", () => {
  it("should work with path", () => {
    updateLocation("/zh/abc");
    expect(detectLocale({ detectFromPath: true })).toBe("zh");

    updateLocation("/en/abc");
    expect(detectLocale({ detectFromPath: true })).toBe("en");
  });

  it("should work with query", () => {
    const queryKey = "lang2";
    updateLocation("/", { [queryKey]: "zh" });
    expect(detectLocale({ queryKey })).toBe("zh");

    updateLocation("/", { [queryKey]: "en" });
    expect(detectLocale({ queryKey })).toBe("en");
  });

  it("should work with storage", () => {
    const storageKey = "lang";
    localStorage.setItem(storageKey, "zh");
    expect(detectLocale({ storageKey })).toBe("zh");
    localStorage.setItem(storageKey, "en");
    expect(detectLocale({ storageKey })).toBe("en");
  });

  it("should work with navigator", () => {
    vi.stubGlobal("navigator", {
      language: "zh-CN",
    });
    expect(detectLocale()).toBe("zh");

    localStorage.clear();
    vi.stubGlobal("navigator", {
      language: "qwer-CN",
    });
    expect(
      detectLocale({
        defaultLocale: LocalesEnum.id,
      })
    ).toBe(LocalesEnum.id);
  });

  it("should with default", () => {
    vi.stubGlobal("navigator", {
      language: "qwer-CN",
    });
    expect(
      detectLocale({
        defaultLocale: LocalesEnum.id,
      })
    ).toBe(LocalesEnum.id);
  });
});
