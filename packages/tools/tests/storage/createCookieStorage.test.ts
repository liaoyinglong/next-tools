import { beforeEach, describe, expect, it } from "vitest";
import { createCookieStorage } from "../../storage/cookie";

//#region mock document.cookie
let cookie = "";
Object.defineProperty(document, "cookie", {
  get(): any {
    return cookie;
  },
  set(v: any) {
    cookie = v;
  },
});
//#endregion

class DataMap {
  name = "";
  age = "0";
}
type A = typeof DataMap;

const namespace = "test";
const storage = createCookieStorage({
  DataMap,
  namespace,
});

describe("createCookieStorage", () => {
  beforeEach(() => {
    document.cookie = "";
  });

  it("namespace correct", () => {
    expect(storage.age.key).toBe("test.age");
  });

  it("get default value", () => {
    expect(storage.age.get()).toBe("0");
  });

  it("set value", () => {
    storage.age.set("1");
    expect(storage.age.get()).toBe("1");
  });

  it("remove", () => {
    storage.age.set("1");
    expect(storage.age.get()).toBe("1");
    storage.age.remove();
    expect(storage.age.get()).toBe("0");
  });

  it("string integration", () => {
    expect(storage.name.get()).toBe("");

    storage.name.set("test");
    expect(storage.name.get()).toBe("test");

    storage.name.remove();
    expect(storage.name.get()).toBe("");
  });

  it("number integration", () => {
    expect(storage.age.get()).toBe("0");

    storage.age.set("1");
    expect(storage.age.get()).toBe("1");

    storage.age.remove();
    expect(storage.age.get()).toBe("0");

    // @ts-expect-error 只能传入 string
    storage.age.set(1);
    expect(storage.age.get()).toBe("1");
  });
});
