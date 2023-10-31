import type { StoreType } from "store2";
import baseStore from "store2";

type StorageType = "local" | "session";

interface CreateStorageConfig<T> {
  /**
   * key 是 存储在 storage 中的 key
   * value 是默认值, 默认值是必须设置的
   * value 给 类型，用于类型推导
   */
  DataMap: new () => T;
  /**
   * 命名空间
   * 会在存储的 key 前面加上命名空间
   */
  namespace: string;
  /**
   * 默认创建 localStorage 的存储
   * 如果需要创建 sessionStorage 的存储，需要传入 storageType: "session"
   * @default "local"
   */
  storageType?: StorageType;
}
class StorageHelper<V = any> {
  /**
   * 存的key 包含 namespace
   * @example
   * namespace = "test"
   * 传入的key = "token"
   * 获取到的 key = "test.token"
   */
  key: string;
  constructor(
    public store: StoreType,
    public namespace: string,
    public baseKey: string,
    public defaultValue: V
  ) {
    this.key = `${namespace}.${baseKey}`;
  }

  get(): V | undefined {
    return this.store.get(this.baseKey) ?? this.defaultValue;
  }

  /**
   * 设置为 undefined 时，会删除该 key
   */
  set(v: V): void {
    v === undefined ? this.remove() : this.store.set(this.baseKey, v);
  }

  remove(): void {
    this.store.remove(this.baseKey);
  }
}

/**
 * 创建 localStorage 或 sessionStorage 的存储
 */
export function createStorage<T extends Record<string, any>>(
  config: CreateStorageConfig<T>
) {
  const { DataMap, namespace, storageType = "local" } = config;

  const store = baseStore[storageType].namespace(namespace);

  const storage: any = {
    _store: store,
  };
  const storageMap = new DataMap();
  Object.keys(storageMap).forEach((key) => {
    storage[key] = new StorageHelper(
      store,
      namespace,
      String(key),
      storageMap[key]
    );
  });
  return storage as {
    [key in keyof T]: StorageHelper<T[key]>;
  } & {
    /**
     * store2 的实例
     * 一般情况下不需要使用 这里暴露出去主要是写测试时使用
     */
    _store: typeof store;
  };
}
