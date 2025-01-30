import { produce } from "immer";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
type State<S extends object, A extends Record<string, Action<S, any>>> = {
  state: S;
  actions: A;
};

export function createStore<
  S extends object,
  A extends Record<string, Action<S, any>>,
>(config: State<S, A>) {
  const useStore = create<S>((set) => {
    return config.state;
  });
  type NormalActions = {
    [key in keyof A]: (payload: Parameters<A[key]>[1]) => void;
  };
  const normalActions: NormalActions = {} as NormalActions;
  Object.keys(config.actions).forEach((key) => {
    // @ts-ignore
    normalActions[key] = (payload) => {
      useStore.setState(
        produce((draft) => {
          config.actions[key](draft, payload);
        }),
        // 尽可能复用 immer 更新的数据
        true,
      );
    };
  });

  return {
    /**
     * 在组件内获取状态
     */
    useSnapshot: useStore,
    /**
     * 一般用于传入select，并且 selector 返回的值是对象，
     * 这样就可以浅比较，减少不必要的更新
     */
    useShallowSnapshot: <U extends object>(select: (state: S) => U) => {
      return useStore(useShallow(select));
    },

    /**
     * 普通方法，设置状态
     */
    actions: normalActions,
    /**
     * 监听状态变化
     */
    subscribe: useStore.subscribe,
    /**
     * 获取状态
     */
    getState: useStore.getState,
  };
}

type Action<S, T> = (state: S, payload: T) => any;
