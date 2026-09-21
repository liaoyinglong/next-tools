import { assertType, describe, it } from 'vitest';
import { createStore } from '../../src/store';

const store = createStore({
  state: { a: 1, b: 2, c: { name: 'hello' }, d: { name: 'world' } },
  actionsCreator: (state) => ({
    setA: (_b: number) => {
      state.a = 123;
    },
    setB: (_b: number) => {
      state.b = 123;
    },
    setC: (name: string) => {
      state.c.name = name;
    },
  }),
  name: 'test',
});

describe('zustand type', () => {
  it('normal actions should work', () => {
    assertType<typeof store.actions.setA>((_b: number) => {});
    assertType<typeof store.actions.setB>((_b: number) => {});
    assertType<typeof store.actions.setC>((_name: string) => {});
  });
  it('useSnapshot should work', () => {
    const {
      //@ts-expect-error a 是 number 类型 , 没有 c 属性
      a: { _c },
    } = store.useSnapshot();
    {
      const { c } = store.useSnapshot();
      assertType<typeof c>({ name: '' });
    }
  });

  it('useShallowSnapshot should work', () => {
    const _a = store.useShallowSnapshot((s) => s.a);

    const d = store.useShallowSnapshot((s) => s.d);
    assertType<typeof d>({ name: '' });
  });
});
