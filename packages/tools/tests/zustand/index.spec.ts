import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createStore } from "../../src/zustand";

function init() {
  return createStore({
    state: { a: 1, b: 2, c: { name: "hello" }, d: { name: "world" } },
    actions: {
      setA: (s, b: number) => {
        s.a = 123;
      },
      setB: (s, b: number) => {
        s.b = 123;
      },
      setCName: (s, name: string) => {
        s.c.name = name;
      },
    },
  });
}
let store: ReturnType<typeof init>;

beforeEach(() => {
  store = init();
});

describe("zustand", () => {
  it("normal actions should work", () => {
    const oldState = store.getState();
    // 更新 a / b ，c / d 的引用和值不会变
    store.actions.setA(123);
    expect(store.getState().a).toBe(123);
    expect(store.getState().c).toBe(oldState.c);
    expect(store.getState().c).toEqual({ name: "hello" });
    expect(store.getState().d).toBe(oldState.d);
    expect(store.getState().d).toEqual({ name: "world" });
    // 更新 c ，c 的引用和值都会变 但是 d 的引用和值不会变
    store.actions.setCName("abc");
    expect(store.getState().c).not.toBe(oldState.c);
    expect(store.getState().c).toEqual({ name: "abc" });
    expect(store.getState().d).toBe(oldState.d);
    expect(store.getState().d).toEqual({ name: "world" });
  });

  describe("react integration", () => {
    it("normal useSnapshot", () => {
      const { result } = renderHook(() => store.useSnapshot());
      expect(result.current).toEqual({
        a: 1,
        b: 2,
        c: { name: "hello" },
        d: { name: "world" },
      });
      act(() => {
        store.actions.setA(123);
      });
      expect(result.current).toEqual({
        a: 123,
        b: 2,
        c: { name: "hello" },
        d: { name: "world" },
      });
    });
    it("useShallowSnapshot", () => {
      let count = 0;
      const { result } = renderHook(() => {
        count++;
        return store.useShallowSnapshot((s) => s.c);
      });
      expect(result.current).toEqual({ name: "hello" });
      expect(count).toBe(1);
      act(() => {
        // 更新 c 以外的值，不应该触发 rerender
        store.actions.setA(123);
      });
      expect(count).toBe(1);
      // 更新 c ，应该触发 rerender
      act(() => {
        store.actions.setCName("abc");
      });
      expect(count).toBe(2);
      expect(result.current).toEqual({ name: "abc" });
    });
  });
});
