import { useSnapshot, proxy as valtioProxy } from "valtio";

import { devtools } from "valtio/utils";

const stores: any = {
  // log with plain object
  print() {
    console.log(stores.snapshot);
  },
  get snapshot(): any {
    const { print, snapshot, ...rest } = stores;
    return snapshot(valtioProxy(rest));
  },
};
//@ts-expect-error for debug
typeof window !== "undefined" && (window.__stores = stores);

export function proxy<T extends object>(
  initialObject: T,
  opts: Options,
): EnhancedStore<T> {
  const store = valtioProxy(initialObject) as EnhancedStore<T>;

  if (typeof window !== "undefined" && opts.devtools === true) {
    devtools(store, {
      name: opts.name,
      enabled: opts.devtools,
    });
  }
  stores[opts.name] = store;

  store.useSnapshot = function useStoreSnapshot(options) {
    return useSnapshot(options?.faker ? emptyStore : store, options) as T;
  };

  return store;
}

interface Options {
  name: string;
  /**
   * false to disable devtools
   * in development mode devtools are enabled by default
   */
  devtools?: boolean;
}
type EnhancedStore<T> = T & {
  useSnapshot(options?: {
    sync?: boolean;
    /**
     * 性能优化，某些 store 变化很频繁
     * 但是其中的值可能在 部分场景才用到
     * 通过设置 faker 为 true，可以避免不必要的渲染
     * faker = true , 时候将返回一个不变的 store，这是假的 store
     */
    faker?: boolean;
  }): T;
};

const emptyStore = valtioProxy({});
