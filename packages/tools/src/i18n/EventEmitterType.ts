/**
 * 这个文件重新定义 lingui 的 EventEmitter 类型
 * 为了 添加更多的事件
 */

export interface EventEmitter {
  on<E extends keyof Events>(event: E, listener: Events[E]): () => void;
  removeListener<E extends keyof Events>(event: E, listener: Events[E]): void;
  emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): void;
}

interface Events {
  change: () => void;
  missing: (event: MissingMessageEvent) => void;
  /**
   * 与 change 事件不同的是：
   * change 事件 不管是语言切换，还是语言包更新，都会触发
   * 而 localeChange 只有语言切换时才会触发
   */
  localeChange: (locale: string) => void;
}

type MissingMessageEvent = {
  locale: string;
  id: string;
};
