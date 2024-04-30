import _ from "lodash";
import { subscribe } from "valtio";

/**
 * 模拟 computed
 *
 * **限制:** 目前支持在 proxy 方法参数的第一级属性定义 computed
 *
 * 用处是可以方便将 StoreA 的某个字段 映射到 StoreB 中
 *
 * 在修改 StoreA 的某个字段时，同时也会同步到 StoreB 中
 *
 * **注意:** 修改 StoreB 的某个字段时，并不会同步到 StoreA 中，这是单向的
 *
 * **场景:**
 * - StoreA 有 a(变动少)、b(变动频繁) 两个字段
 * - StoreB 有 c(依赖 StoreA.a 计算得到)
 *
 * 如何直接在 StoreB 中定义 prop 存放 StoreA 的话，会导致不必要的计算
 *
 * 1. 为了性能考虑，是不关心 StoreA.b 的变化的，只关心 StoreA.a 的变化
 * 2. 其实就是这个的封装 https://valtio.pmnd.rs/docs/guides/computed-properties
 *
 *
 * @param watchSource 必须是 valtio proxy 对象，不然无法追踪响应式变化
 */
export const computed = <T extends object, R>(
  watchSource: T,
  getter: (watchSource: T) => R,
): Computed<R> => {
  return {
    valueType: "" as never,
    $$type: "computed",
    setup(store: any, key: any) {
      let initialized = false;
      const cb = () => {
        const newValue = getter(watchSource);
        if (initialized && _.isEqual(store[key], newValue)) {
          return;
        }
        initialized = true;
        store[key] = newValue;
      };
      // 先触发一次计算，拿到初始值
      cb();
      // 订阅 source，source 发现变化，触发计算
      // TODO: 取消订阅？暂时不需要，目前的场景都是全局的
      subscribe(watchSource, cb);
    },
  };
};

export const isComputed = (v: any): v is Computed<any> => {
  return typeof v === "object" && v.$$type === "computed";
};

export type Computed<V = any> = {
  // runtime 不要使用，这里只是为了类型
  valueType: V;
  $$type: "computed";
  setup(store: any, key: any): void;
};

export type CombineComputed<T> = T extends Computed<infer U> ? U : T;
