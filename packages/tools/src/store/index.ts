import _ from "lodash";
import { useDebugValue, useRef, useSyncExternalStore } from "react";
import { proxy, snapshot, subscribe, useSnapshot } from "valtio";

const stores: any = {};

if (typeof window !== "undefined") {
  Object.defineProperty(window, "__stores2", {
    get() {
      let s: any = {};
      Object.keys(stores).forEach((key) => {
        const store = stores[key];
        const state = store.getState();
        s[key] = state;
      });

      return { ...s, __raw: stores };
    },
  });
}

type Config<S extends object, A extends Record<string, Action<S, any>>> = {
  name: string;
  state: S;
  actionsCreator: (state: S) => A;
};

export function createStore<
  S extends object,
  A extends Record<string, Action<S, any>>,
>(config: Config<S, A>) {
  const store = proxy(config.state);
  const initialState = snapshot(store) as S;

  const actions = config.actionsCreator(store);

  const api = {
    /**
     * 状态 可以直接修改，会触发状态变化
     */
    state: store,
    /**
     * 初始状态 快照
     */
    initialState,
    /**
     * 获取当前状态 快照
     */
    getState() {
      return snapshot(store) as S;
    },
    actions,
    /**
     * 监听状态变化
     */
    subscribe(fn: (state: S) => void) {
      return subscribe(store, (ops) => {
        const state = api.getState();
        fn(state);
      });
    },
    /**
     * 获取当前状态 快照
     */
    useSnapshot() {
      return useSnapshot(store) as S;
    },
    useShallowSnapshot<T>(selector: (state: S) => T) {
      const prev = useRef<T>(undefined);
      const combinedSelector = (state: S) => {
        const next = selector(state);
        if (!_.isEqual(prev.current, next)) {
          prev.current = next;
        }
        return prev.current;
      };
      const slice = useSyncExternalStore(
        api.subscribe,
        () => {
          return combinedSelector(api.getState());
        },
        () => {
          return combinedSelector(api.initialState);
        },
      );
      useDebugValue(slice);
      return slice;
    },
  };

  stores[config.name] = api;

  return api;
}

type Action<S, T> = (payload: T) => any;
