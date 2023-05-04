import Cookies from "js-cookie";
import type { CookieAttributes, CookiesStatic } from "js-cookie";

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
    public store: CookiesStatic,
    public namespace: string,
    public baseKey: string,
    public defaultValue: V
  ) {
    this.key = `${namespace}.${baseKey}`;
  }

  get(): V | undefined {
    return (this.store.get(this.baseKey) ?? this.defaultValue) as never;
  }

  /**
   * 设置为 undefined 时，会删除该 key
   */
  set(v: V, options?: CookieAttributes): void {
    v === undefined
      ? this.remove(options)
      : this.store.set(this.baseKey, v as never, options);
  }

  remove(options?: CookieAttributes): void {
    this.store.remove(this.baseKey, options);
  }
}

/**
 * 创建 cookie 的存储
 */
export function createCookieStorage<T extends Record<string, any>>(
  config: CreateStorageConfig<T>
) {
  const { DataMap, namespace } = config;

  const storage: any = {};
  const storageMap = new DataMap();
  Object.keys(storageMap).forEach((key) => {
    storage[key] = new StorageHelper(
      Cookies,
      namespace,
      String(key),
      storageMap[key]
    );
  });
  return storage as {
    [key in keyof T]: StorageHelper<T[key]>;
  };
}
