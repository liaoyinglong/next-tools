import { assertType, describe, expectTypeOf, it } from 'vitest';
import { defineReducer } from '../../src/reducer';

const reducer = defineReducer({
  state: () => ({ count: 0, user: { name: '' } }),
  actions: {
    inc(draft) {
      expectTypeOf(draft).toEqualTypeOf<{
        count: number;
        user: { name: string };
      }>();
      draft.count++;
    },
    setName(draft, name: string) {
      draft.user.name = name;
    },
    replace(_draft, next: { count: number; user: { name: string } }) {
      return next;
    },
  },
});

describe('defineReducer types', () => {
  it('binds actions without the draft parameter', () => {
    const [state, actions] = reducer.useReducer();
    expectTypeOf(state.count).toEqualTypeOf<number>();
    expectTypeOf(actions.inc).toEqualTypeOf<() => void>();
    expectTypeOf(actions.setName).toEqualTypeOf<(name: string) => void>();
    expectTypeOf(actions.replace).returns.toEqualTypeOf<void>();
    expectTypeOf(actions.replace).parameters.toEqualTypeOf<
      [next: { count: number; user: { name: string } }]
    >();
  });

  it('rejects wrong payloads', () => {
    const [, actions] = reducer.useReducer();
    // @ts-expect-error payload 必须是 string
    actions.setName(1);
    // @ts-expect-error inc 不接收 payload
    actions.inc(1);
  });

  it('initOverride is a partial state', () => {
    assertType(reducer.useReducer({ count: 1 }));
    // @ts-expect-error count 必须是 number
    reducer.useReducer({ count: '1' });
  });

  it('rejects actions returning a non-state value', () => {
    defineReducer({
      state: () => ({ count: 0 }),
      actions: {
        // @ts-expect-error 返回值只能是 void 或完整 state
        bad() {
          return { count: 'x' };
        },
      },
    });
  });

  it('rejects async actions', () => {
    defineReducer({
      state: () => ({ count: 0 }),
      actions: {
        // @ts-expect-error immer 的 draft 在 action 结束后失效，不支持 async
        async load(draft) {
          draft.count = 1;
        },
      },
    });
  });
});
