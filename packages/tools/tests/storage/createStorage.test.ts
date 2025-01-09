import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createStorage } from "../../src/storage";

class DataMap {
  name = "";
  age = 0;
  setting: { isLogin: boolean } = { isLogin: false };
}
const namespace = "test";
function initStorage() {
  const storage = createStorage({
    DataMap,
    namespace,
  });
  storage._store.clearAll();
  return storage;
}
let storage = initStorage();

describe("createStorage", () => {
  beforeEach((v) => {
    storage = initStorage();
  });

  it("namespace correct", () => {
    expect(storage.age.key).toBe("test.age");
  });

  it("get default value", () => {
    expect(storage.age.get()).toBe(0);
  });

  it("set value", () => {
    storage.age.set(1);
    expect(storage.age.get()).toBe(1);
  });

  it("remove", () => {
    storage.age.set(1);
    expect(storage.age.get()).toBe(1);
    storage.age.remove();
    expect(storage.age.get()).toBe(0);
  });

  it("object integration", () => {
    expect(storage.setting.get()).toEqual({ isLogin: false });

    storage.setting.set({ isLogin: true });
    expect(storage.setting.get()).toEqual({ isLogin: true });

    storage.setting.remove();
    expect(storage.setting.get()).toEqual({ isLogin: false });
  });

  it("string integration", () => {
    expect(storage.name.get()).toBe("");

    storage.name.set("test");
    expect(storage.name.get()).toBe("test");

    storage.name.remove();
    expect(storage.name.get()).toBe("");
  });

  it("number integration", () => {
    expect(storage.age.get()).toBe(0);

    storage.age.set(1);
    expect(storage.age.get()).toBe(1);

    storage.age.remove();
    expect(storage.age.get()).toBe(0);
  });

  describe("react hooks", () => {
    it("should work", () => {
      const { result } = renderHook(() => storage.age.useValue());
      expect(result.current).toBe(0);
      act(() => {
        storage.age.set(1);
      });
      expect(result.current).toBe(1);
    });

    it("with object", () => {
      const { result } = renderHook(() => storage.setting.useValue());
      expect(result.current).toEqual({ isLogin: false });
      act(() => {
        storage.setting.set({ isLogin: true });
      });
      expect(result.current).toEqual({ isLogin: true });
    });

    it("没有多余的 rerender", () => {
      let count = 0;
      const { result } = renderHook(() => {
        count++;
        return storage.setting.useValue();
      });
      expect(count).toBe(1);
      expect(result.current).toEqual({ isLogin: false });

      // 更新 age 不应该触发 rerender
      act(() => {
        storage.age.set(1);
      });
      expect(count).toBe(1);

      // 更新 setting 应该触发 rerender
      act(() => {
        storage.setting.set({ isLogin: true });
      });
      expect(count).toBe(2);
      expect(result.current).toEqual({ isLogin: true });
    });
  });
});
