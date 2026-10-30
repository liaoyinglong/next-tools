import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defineReducer } from '../../src/reducer';

type Status = 'idle' | 'ready';

const profileReducer = defineReducer({
  state: () => ({
    user: { profile: { name: '' } },
    status: 'idle' as Status,
    errors: [] as string[],
  }),
  actions: {
    updateProfile(draft, name: string) {
      draft.user.profile.name = name;
      draft.status = 'ready';
    },
    addError(draft, error: string) {
      draft.errors.push(error);
    },
    reset() {
      return {
        user: { profile: { name: '' } },
        status: 'idle' as Status,
        errors: [],
      };
    },
  },
});

const replaceReducer = defineReducer({
  state: () => ({ a: 1 }) as { a?: number; b?: number },
  actions: {
    swap() {
      return { b: 2 };
    },
  },
});

describe('defineReducer', () => {
  it('returns the initial state from the state factory', () => {
    const { result } = renderHook(() => profileReducer.useReducer());
    expect(result.current[0]).toEqual({
      user: { profile: { name: '' } },
      status: 'idle',
      errors: [],
    });
  });

  it('shallow merges initOverride into the initial state', () => {
    const { result } = renderHook(() =>
      profileReducer.useReducer({ status: 'ready' }),
    );
    expect(result.current[0].status).toBe('ready');
    expect(result.current[0].errors).toEqual([]);
  });

  it('actions mutate the draft and rerender with the new state', () => {
    const { result } = renderHook(() => profileReducer.useReducer());
    act(() => {
      result.current[1].updateProfile('Leon');
    });
    expect(result.current[0].user.profile.name).toBe('Leon');
    expect(result.current[0].status).toBe('ready');
  });

  it('each hook call owns an independent state', () => {
    const first = renderHook(() => profileReducer.useReducer());
    const second = renderHook(() => profileReducer.useReducer());
    act(() => {
      first.result.current[1].addError('boom');
    });
    expect(first.result.current[0].errors).toEqual(['boom']);
    expect(second.result.current[0].errors).toEqual([]);
  });

  it('returning a value from an action replaces the whole state', () => {
    const { result } = renderHook(() => profileReducer.useReducer());
    act(() => {
      result.current[1].updateProfile('Leon');
      result.current[1].addError('boom');
    });
    act(() => {
      result.current[1].reset();
    });
    expect(result.current[0]).toEqual({
      user: { profile: { name: '' } },
      status: 'idle',
      errors: [],
    });
  });

  it('replacing state removes keys missing from the new state', () => {
    const { result } = renderHook(() => replaceReducer.useReducer());
    act(() => {
      result.current[1].swap();
    });
    expect(result.current[0]).toEqual({ b: 2 });
  });

  it('state is a plain frozen object', () => {
    const { result } = renderHook(() => profileReducer.useReducer());
    act(() => {
      result.current[1].updateProfile('Leon');
    });
    expect(Object.isFrozen(result.current[0])).toBe(true);
    expect(Object.isFrozen(result.current[0].user.profile)).toBe(true);
  });

  it('keeps references of unchanged branches', () => {
    const { result } = renderHook(() => profileReducer.useReducer());
    const prevUser = result.current[0].user;
    act(() => {
      result.current[1].addError('boom');
    });
    expect(result.current[0].user).toBe(prevUser);
  });

  it('keeps actions referentially stable across rerenders', () => {
    const { result } = renderHook(() => profileReducer.useReducer());
    const firstActions = result.current[1];
    act(() => {
      result.current[1].updateProfile('Leon');
    });
    expect(result.current[1]).toBe(firstActions);
  });
});
