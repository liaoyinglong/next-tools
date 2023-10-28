import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalesEnum, i18n } from "../../i18n";
import { detectLocale } from "../../i18n/detectLocale";

i18n.load({
  [LocalesEnum.zh]: {},
  [LocalesEnum.en]: {},
  [LocalesEnum.id]: {},
});
const storageKey = "lang";

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
    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "en");
    updateLocation("/zh/abc");
    expect(detectLocale({ detectFromPath: true })).toBe("zh");

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "zh");
    updateLocation("/en/abc");
    expect(detectLocale({ detectFromPath: true })).toBe("en");
  });

  it("should work with query", () => {
    const queryKey = "lang2";

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "en");
    updateLocation("/", { [queryKey]: "zh" });
    expect(detectLocale({ queryKey })).toBe("zh");

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "zh");
    updateLocation("/", { [queryKey]: "en" });
    expect(detectLocale({ queryKey })).toBe("en");
  });

  it("should work with storage", () => {
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
