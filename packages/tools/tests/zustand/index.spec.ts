import { describe, expect, it } from "vitest";
import { createStore } from "../../src/zustand";

describe("zustand", () => {
  it("normal actions should work", () => {
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

    const oldState = store.getState();
    // 更新 a / b ，c / d 的引用和值不会变
    store.actions.setA(123);
    expect(store.getState().a).toBe(123);
    expect(store.getState().c).toBe(oldState.c);
    expect(store.getState().c).toEqual({ name: "hello" });
    expect(store.getState().d).toBe(oldState.d);
    expect(store.getState().d).toEqual({ name: "world" });
    // 更新 c ，c 的引用和值都会变 但是 d 的引用和值不会变
    store.actions.setC("abc");
    expect(store.getState().c).not.toBe(oldState.c);
    expect(store.getState().c).toEqual({ name: "abc" });
    expect(store.getState().d).toBe(oldState.d);
    expect(store.getState().d).toEqual({ name: "world" });
  });
});
