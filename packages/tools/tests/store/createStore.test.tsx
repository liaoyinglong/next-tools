import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createStore } from '../../src/store';

function initStore() {
  return createStore({
    name: 'test-store',
    state: { count: 0, label: 'hello' },
    actionsCreator: (state) => ({
      increment() {
        state.count++;
      },
      setLabel(label: string) {
        state.label = label;
      },
    }),
  });
}

describe('createStore', () => {
  it('getState returns current snapshot', () => {
    const store = initStore();
    expect(store.getState()).toEqual({ count: 0, label: 'hello' });
  });

  it('initialState is immutable snapshot of initial values', () => {
    const store = initStore();
    store.state.count = 99;
    expect(store.initialState).toEqual({ count: 0, label: 'hello' });
  });

  it('actions mutate state', () => {
    const store = initStore();
    store.actions.increment();
    expect(store.getState().count).toBe(1);
  });

  it('subscribe fires on state change', async () => {
    const store = initStore();
    const values: number[] = [];
    store.subscribe((s) => values.push(s.count));
    store.state.count = 5;
    await Promise.resolve();
    expect(values).toEqual([5]);
  });

  describe('useShallowSnapshot', () => {
    it('returns selected slice of state', () => {
      const store = initStore();
      const { result } = renderHook(() =>
        store.useShallowSnapshot((s) => ({ count: s.count })),
      );
      expect(result.current).toEqual({ count: 0 });
    });

    it('return type is non-nullable', () => {
      const store = initStore();
      const { result } = renderHook(() =>
        store.useShallowSnapshot((s) => ({ count: s.count })),
      );
      const value: { count: number } = result.current;
      expect(value).toBeDefined();
    });

    it('updates when selected slice changes', async () => {
      const store = initStore();
      const { result } = renderHook(() =>
        store.useShallowSnapshot((s) => ({ count: s.count })),
      );
      await act(async () => {
        store.actions.increment();
        await Promise.resolve();
      });
      expect(result.current).toEqual({ count: 1 });
    });

    it('does not rerender when unrelated state changes', () => {
      const store = initStore();
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return store.useShallowSnapshot((s) => ({ count: s.count }));
      });
      expect(renderCount).toBe(1);
      expect(result.current).toEqual({ count: 0 });

      act(() => {
        store.actions.setLabel('world');
      });
      expect(renderCount).toBe(1);
    });

    it('preserves referential identity for equal slices', () => {
      const store = initStore();
      let prevRef: unknown;
      const { result } = renderHook(() => {
        const slice = store.useShallowSnapshot((s) => ({ count: s.count }));
        prevRef = slice;
        return slice;
      });
      const firstRef = prevRef;

      act(() => {
        store.actions.setLabel('changed');
      });
      expect(result.current).toBe(firstRef);
    });
  });
});
