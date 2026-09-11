import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStore } from '../../src/store';

function init() {
  return createStore({
    state: { a: 1, b: 2, c: { name: 'hello' }, d: { name: 'world' } },
    actionsCreator: (state) => ({
      setA: (b: number) => {
        state.a = 123;
      },
      setB: (b: number) => {
        state.b = 123;
      },
      setCName: (name: string) => {
        state.c.name = name;
      },
    }),
    name: 'test',
  });
}
let store: ReturnType<typeof init>;

beforeEach(() => {
  store = init();
});

describe('zustand', () => {
  it('normal actions should work', () => {
    store.actions.setA(123);
    expect(store.state.a).toBe(123);
    expect(store.state.c).toEqual({ name: 'hello' });
    expect(store.state.d).toEqual({ name: 'world' });
    store.actions.setCName('abc');
    expect(store.state.c).toEqual({ name: 'abc' });
    expect(store.state.d).toEqual({ name: 'world' });
  });

  describe('react integration', () => {
    it('normal useSnapshot', async () => {
      const { result } = renderHook(() => store.useSnapshot());
      expect(result.current).toEqual({
        a: 1,
        b: 2,
        c: { name: 'hello' },
        d: { name: 'world' },
      });
      await act(() => {
        store.actions.setA(123);
      });
      expect(result.current).toEqual({
        a: 123,
        b: 2,
        c: { name: 'hello' },
        d: { name: 'world' },
      });
    });
    it('useShallowSnapshot', async () => {
      let count = 0;
      const { result } = renderHook(() => {
        count++;
        return store.useShallowSnapshot((s) => s.c);
      });
      expect(result.current).toEqual({ name: 'hello' });
      expect(count).toBe(1);
      await act(() => {
        // 更新 c 以外的值，不应该触发 rerender
        store.actions.setA(123);
      });
      expect(count).toBe(1);
      // 更新 c ，应该触发 rerender
      await act(() => {
        store.actions.setCName('abc');
      });
      expect(count).toBe(2);
      expect(result.current).toEqual({ name: 'abc' });
    });
  });
});
