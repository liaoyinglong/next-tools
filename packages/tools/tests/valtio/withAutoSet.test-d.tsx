import { assertType, describe, it } from "vitest";
import { proxy } from "../../valtio";
import { withAutoSet } from "../../valtio/withAutoSet";

describe("withAutoSet", () => {
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

  type Store2 = typeof store2;

  it("set function should correct", () => {
    assertType<Store2["count"]>(store.count);
    assertType<Store2["name"]>(store.name);
    assertType<Store2["setCount"]>((v: number) => {});
    assertType<Store2["setName"]>((v: string) => {});
  });
});
