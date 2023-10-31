import { assertType, describe, it } from "vitest";
import { OptionalKeys } from "../../shared/OptionalKeys";

describe("OptionalKeys", () => {
  it("should be ok", () => {
    type A = {
      name: string;
      age: number;
      work?: string;
    };
    type B = {
      name: string;
    };
    type C = OptionalKeys<A, B>;
    //   ^? "work" | "name"

    assertType<C>("work");
    assertType<C>("name");
    // @ts-expect-error wrong types
    assertType<C>("age");
  });
});
