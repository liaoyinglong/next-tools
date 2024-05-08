import _ from "lodash";

//# region 增强 set 方法
type EnhancedWithSet<T extends object> = T & {
  [k in NotFunctionKeys<T> as SetFnName<k> extends keyof T
    ? never
    : SetFnName<k>]: (v: T[k]) => void;
};
type SetFnName<T> = T extends string ? `set${Capitalize<T>}` : never;
type NotFunctionKeys<T extends object> = keyof {
  [k in keyof T as T[k] extends Function ? never : k]: T[k];
};
//# endregion

/**
 * 为传进来的 store 增加相关属性的 set 方法
 * eg:
 *   const store = { a: 1, b: 2 };
 *   const enhancedStore = addSetMethod(store);
 * output:
 *   enhancedStore = { a: 1, b: 2, setA: (v) => { enhancedStore.a = v; }, setB: (v) => { enhancedStore.b = v; } };
 */
export function withAutoSet<T extends object>(store: T) {
  type Result = T & EnhancedWithSet<T>;

  const enhancedStore = store as Result;

  _.forEach(enhancedStore, (value, key) => {
    if (typeof value === "function") {
      return;
    }
    const setFnName = `set${_.upperFirst(key)}` as keyof Result;

    if (_.has(store, setFnName)) {
      return;
    }
    // @ts-expect-error need to be fixed
    enhancedStore[setFnName] = (v) => {
      // @ts-expect-error need to be fixed
      enhancedStore[key] = v;
    };
  });

  return enhancedStore;
}

//type AA33 = NotFunctionKeys<A>;
//type A = { a: string; b: number; setA: () => void };
//type AA2 = Omit<A, SetFnName<keyof A>>;
//type AA3 = {
//  [k in keyof AA2 as SetFnName<k> extends keyof A ? never : SetFnName<k>]: (
//    v: AA2[k],
//  ) => void;
//} & A;
//type StringKeys<T> = Extract<keyof T, string>;
//type Debug<T> = {
//  [k in keyof T]: T[k];
//};
//type A22 = Debug<AA3>;
//type A222 = Debug<EnhancedWithSet<A>>;
