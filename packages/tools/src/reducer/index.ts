import { produce, type Draft } from 'immer';
import { useReducer, useState } from 'react';

/**
 * action 的定义
 * - draft 是可直接修改的状态，action 结束后即失效，因此不支持 async
 * - 返回 void 表示原地修改；返回完整的新 state 表示整体替换
 */
type ActionDefinition<S> = (draft: Draft<S>, payload: any) => S | void;

/**
 * 去掉 draft 参数后的 action，调用时只需传 payload
 */
type BoundActions<A> = {
  [K in keyof A]: A[K] extends (draft: any, ...args: infer P) => any
    ? (...args: P) => void
    : never;
};

type Config<S extends object, A extends Record<string, ActionDefinition<S>>> = {
  /**
   * 初始状态工厂，每次 useReducer 调用都会生成一份独立的状态
   */
  state: () => S;
  actions: A;
};

type DispatchedAction = { name: string; payload: unknown };

/**
 * 定义组件内的局部 reducer
 * - 基于 React useReducer + immer，action 内可直接修改 draft
 * - 需要跨组件共享时，请用 Context 包一层，或改用 createStore
 */
export function defineReducer<
  S extends object,
  A extends Record<string, ActionDefinition<S>>,
>(config: Config<S, A>) {
  const reducer = (state: S, action: DispatchedAction): S =>
    produce(
      state,
      // action 返回完整新 state 时由 immer 整体替换；泛型下 S 与 Draft<S> 无法自动对齐，需显式标注
      (draft) =>
        config.actions[action.name]!(draft, action.payload) as Draft<S> | void,
    );

  const init = (initOverride: Partial<S> | undefined): S => ({
    ...config.state(),
    ...initOverride,
  });

  return {
    /**
     * @param initOverride 浅合并到 state() 的结果上
     * @returns [当前状态（不可变）, 引用稳定的 actions]
     */
    useReducer(initOverride?: Partial<S>) {
      const [state, dispatch] = useReducer(reducer, initOverride, init);
      const [actions] = useState(() => {
        const bound: Record<string, (payload?: unknown) => void> = {};
        Object.keys(config.actions).forEach((name) => {
          bound[name] = (payload) => dispatch({ name, payload });
        });
        return bound as BoundActions<A>;
      });
      return [state, actions] as const;
    },
  };
}
