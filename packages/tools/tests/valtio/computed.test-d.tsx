import { assertType, describe, it } from "vitest";
import { proxy } from "../../valtio";
import { computed } from "../../valtio/computed";

describe("computed", () => {
  const storeA = proxy(
    {
      count: 0,
      info: {
        name: "hello",
        age: 18,
      },
    },
    { name: "storeA" },
  );
  const storeB = proxy(
    {
      infoName: computed(storeA, (a) => {
        return a.info.name;
      }),
      infoAge: computed(storeA, (a) => {
        return a.info.age;
      }),
    },
    { name: "storeB" },
  );

  type Store2 = typeof storeB;

  it("set function should correct", () => {
    assertType<Store2["infoAge"]>(0);
    assertType<Store2["infoName"]>("");
  });
});
