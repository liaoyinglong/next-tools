import baseStore from "store2";

type StorageType = "local" | "session";

interface CreateStorageConfig<T> {
  /**
   * key 是 存储在 storage 中的 key
   * value 是默认值
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

export function createStorage<T extends Record<string, any>>(
  config: CreateStorageConfig<T>
) {
  const { DataMap, namespace, storageType = "local" } = config;

  const store = baseStore[storageType].namespace(namespace);

  class StorageHelper<V = any> {
    /**
     * 存的key 包含 namespace
     * @example
     * namespace = "test"
     * 传入的key = "token"
     * 获取到的 key = "test.token"
     */
    key: string;
    constructor(private baseKey: string, private defaultValue: V) {
      this.key = `${namespace}.${baseKey}`;
    }

    get(): V | undefined {
      return store.get(this.baseKey) ?? this.defaultValue;
    }

    /**
     * 设置为 undefined 时，会删除该 key
     */
    set(v: V): void {
      v === undefined ? this.remove() : store.set(this.baseKey, v);
    }

    remove(): void {
      store.remove(this.baseKey);
    }
  }

  const storage: any = {};
  const storageMap = new DataMap();
  Object.keys(storageMap).forEach((key) => {
    storage[key] = new StorageHelper(String(key), storageMap[key]);
  });
  return storage as {
    [key in keyof T]: StorageHelper<T[key]>;
  };
}
