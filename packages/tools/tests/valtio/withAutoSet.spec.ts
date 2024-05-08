import { describe, expect, it } from "vitest";
import { proxy } from "../../src/valtio";
import { withAutoSet } from "../../src/valtio/withAutoSet";

describe("withAutoSet", () => {
  it("set method should work", () => {
    let store = proxy(
      {
        count: 0,
        name: "hello",
      },
      {
        name: "withAutoSet",
      },
    );
    const store2 = withAutoSet(store);

    expect(typeof store2.setCount).toBe("function");
    expect(typeof store2.setName).toBe("function");

    store2.setCount(1);

    expect(store.count).toBe(1);
    expect(store2.count).toBe(1);

    store2.setName("world");
    expect(store.name).toBe("world");
    expect(store2.name).toBe("world");
  });
});
