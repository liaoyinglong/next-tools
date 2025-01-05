import { assertType, describe, it } from "vitest";
import { createStore } from "../../src/zustand";

const store = createStore({
  state: { a: 1, b: 2, c: { name: "hello" }, d: { name: "world" } },
  actions: {
    setA: (s, b: number) => {
      s.a = 123;
    },
    setB: (s, b: number) => {
      s.b = 123;
    },
    setC: (s, name: string) => {
      s.c.name = name;
    },
  },
});

describe("zustand type", () => {
  it("normal actions should work", () => {
    assertType<typeof store.actions.setA>((b: number) => {});
    assertType<typeof store.actions.setB>((b: number) => {});
    assertType<typeof store.actions.setC>((name: string) => {});
  });
  it("useSnapshot should work", () => {
    //@ts-expect-error a 是 number 类型 , 没有 c 属性
    store.useSnapshot((s) => s.a.c);

    const c = store.useSnapshot((s) => s.c);
    assertType<typeof c>({ name: "" });
  });

  it("useShallowSnapshot should work", () => {
    //@ts-expect-error a 是 number 类型，不符合 U extends object 的类型
    const a = store.useShallowSnapshot((s) => s.a);

    const d = store.useShallowSnapshot((s) => s.d);
    assertType<typeof d>({ name: "" });
  });
});
