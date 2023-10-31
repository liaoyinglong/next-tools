import type { CookieAttributes, CookiesStatic } from "js-cookie";
import Cookies from "js-cookie";

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

// cookie 只能存 string
type V = string;
class StorageHelper {
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
    public defaultValue: string
  ) {
    this.key = `${namespace}.${baseKey}`;
  }

  get(): V | undefined {
    let r = this.store.get(this.key);
    // 这里返回的是 string | undefined 所有可以用 !r
    if (!r) {
      r = this.defaultValue;
    }
    return r;
  }

  /**
   * 设置为 undefined 时，会删除该 key
   */
  set(v: V, options?: CookieAttributes): void {
    v === undefined
      ? this.remove(options)
      : this.store.set(this.key, v as never, options);
  }

  remove(options?: CookieAttributes): void {
    this.store.remove(this.key, options);
  }
}

/**
 * 创建 cookie 的存储
 * cookie 有 大小限制，所以不要存太多数据
 * 默认情况下 key/value 都会被转为 string
 */
export function createCookieStorage<T extends Record<any, any>>(
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
      // cookie 只能存 string
      storageMap[key] + ""
    );
  });

  return storage as Record<keyof T, StorageHelper>;
}
