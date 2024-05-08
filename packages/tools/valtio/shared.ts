export type EnhancedStore<T extends object> = T & {
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
