import { isEqual } from 'es-toolkit';
import { useSyncExternalStore } from 'react';
import type { StoreType } from 'store2';
import baseStore from 'store2';

type StorageType = 'local' | 'session';

interface CreateStorageConfig<T> {
  /**
   * key 是 存储在 storage 中的 key
   * value 是默认值, 默认值是必须设置的
   * value 给 类型，用于类型推导
   */
  DataMap: new () => T;
  /**
   * 命名空间，会在存储的 key 前面加上 `namespace.` 前缀
   * 不传或传空字符串时，直接使用原始 key（适用于兼容老项目已有 key）
   */
  namespace?: string;
  /**
   * 默认创建 localStorage 的存储
   * 如果需要创建 sessionStorage 的存储，需要传入 storageType: "session"
   * @default "local"
   */
  storageType?: StorageType;
}
class StorageHelper<V = any> {
  /**
   * 用来缓存当前值
   * - 防止值是 object 的时候，每次 get 都都返回新的对象，导致 react 的 重复渲染
   * - 在 set 时，如果值没有发生变化，则不触发 storage 事件
   * - 在 get 时，如果值没有发生变化，则直接返回缓存的值
   */
  private currentValue: V | undefined = undefined;
  constructor(
    public store: StoreType['local'],
    public key: string,
    public defaultValue: V,
  ) {
    this.currentValue = this.defaultValue;
  }

  get(): V | undefined {
    const r = this.store.get(this.key) ?? this.defaultValue;
    if (!isEqual(r, this.currentValue)) {
      this.currentValue = r;
    }
    return this.currentValue;
  }

  /**
   * 设置为 undefined 时，会删除该 key
   */
  set(v: V | undefined): void {
    if (isEqual(v, this.currentValue)) {
      return;
    }
    this.currentValue = v;
    v === undefined ? this.store.remove(this.key) : this.store.set(this.key, v);
    this.notifyListeners();
  }

  remove(): void {
    this.set(undefined);
  }

  private listeners = new Set<() => void>();
  private notifyListeners = () => {
    this.listeners.forEach((listener) => listener());
  };
  /**
   * 订阅 storage 事件
   * @param listener
   * @returns
   */
  subscribe = (listener: () => void) => {
    // for current window
    this.listeners.add(listener);
    // for other windows
    window.addEventListener('storage', listener);

    return () => {
      this.listeners.delete(listener);
      window.removeEventListener('storage', listener);
    };
  };

  /**
   * 这是 react hooks 的 useValue 的实现
   */
  useValue() {
    return useSyncExternalStore(
      this.subscribe,
      this.getSnapshot,
      this.getServerSnapshot,
    );
  }
  private getSnapshot = this.get.bind(this);
  private getServerSnapshot = () => {
    return this.defaultValue;
  };
}

/**
 * 创建 localStorage 或 sessionStorage 的存储
 */
export function createStorage<T extends Record<string, any>>(
  config: CreateStorageConfig<T>,
) {
  const { DataMap, namespace, storageType = 'local' } = config;

  const store: StoreType['local'] = baseStore[storageType];

  const storage: any = {
    _store: store,
  };
  const storageMap = new DataMap();
  Object.keys(storageMap).forEach((key) => {
    storage[key] = new StorageHelper(
      store,
      namespace ? `${namespace}.${String(key)}` : String(key),
      storageMap[key],
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
