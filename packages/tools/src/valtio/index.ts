import { snapshot, useSnapshot, proxy as valtioProxy } from "valtio";

import { devtools } from "valtio/utils";
import type { EnhancedStore } from "./shared";

export { snapshot, subscribe } from "valtio";
export { proxyMap, proxySet, subscribeKey, watch } from "valtio/utils";
export { withAutoSet } from "./withAutoSet";

const stores: any = {};

if (typeof window !== "undefined") {
  Object.defineProperty(window, "__stores", {
    get() {
      const r = snapshot(valtioProxy(stores));
      return { ...r, __raw: stores };
    },
  });
}

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
