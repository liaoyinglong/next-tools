import { beforeEach, describe, expect, it } from "vitest";
import { createStorage } from "../../src";

class DataMap {
  name = "";
  age = 0;
  setting: { isLogin: boolean } = { isLogin: false };
}
const namespace = "test";
const storage = createStorage({
  DataMap,
  namespace,
});

describe("createStorage", () => {
  beforeEach(() => {
    storage._store.clearAll();
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
});
