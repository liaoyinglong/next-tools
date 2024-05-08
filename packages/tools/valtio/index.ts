import { useSnapshot, proxy as valtioProxy } from "valtio";

import { devtools } from "valtio/utils";
import type { EnhancedStore } from "./shared";

export { snapshot, subscribe } from "valtio";
export { proxyMap, proxySet, subscribeKey, watch } from "valtio/utils";

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

const emptyStore = valtioProxy({});
