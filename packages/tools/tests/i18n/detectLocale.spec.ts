import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalesEnum, i18n } from "../../i18n";

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
  i18n.resetConfig();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("detectLocale", () => {
  it("should work with path", () => {
    i18n.updateConfig({ detectFromPath: true });

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "en");
    updateLocation("/zh/abc");
    expect(i18n.detectLocale()).toBe("zh");

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "zh");
    updateLocation("/en/abc");
    expect(i18n.detectLocale()).toBe("en");
  });

  it("should work with query", () => {
    const queryKey = "lang2";
    i18n.updateConfig({ queryKey, storageKey });

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "en");
    updateLocation("/", { [queryKey]: "zh" });
    expect(i18n.detectLocale()).toBe("zh");

    // 即使 localStorage 有值，也不会使用 , localStorage 优先级不够
    localStorage.setItem(storageKey, "zh");
    updateLocation("/", { [queryKey]: "en" });
    expect(i18n.detectLocale()).toBe("en");
  });

  it("should work with storage", () => {
    i18n.updateConfig({ storageKey });

    localStorage.setItem(storageKey, "zh");
    expect(i18n.detectLocale()).toBe("zh");
    localStorage.setItem(storageKey, "en");
    expect(i18n.detectLocale()).toBe("en");
  });

  it("should work with navigator", () => {
    vi.stubGlobal("navigator", {
      language: "zh-CN",
    });
    expect(i18n.detectLocale()).toBe("zh");

    localStorage.clear();
    vi.stubGlobal("navigator", {
      language: "qwer-CN",
    });

    i18n.updateConfig({ defaultLocale: LocalesEnum.id });
    expect(i18n.detectLocale()).toBe(LocalesEnum.id);
  });

  it("should with default", () => {
    vi.stubGlobal("navigator", {
      language: "qwer-CN",
    });
    i18n.updateConfig({ defaultLocale: LocalesEnum.id });

    expect(i18n.detectLocale()).toBe(LocalesEnum.id);
  });
});
