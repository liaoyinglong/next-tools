import _ from "lodash";
import store2 from "store2";
import { Level, type OnLogParams } from "./shared";

type StorageState = Record<string, Level>;

export type OnLog = (data: OnLogParams) => void;

export class Logger {
  constructor(
    public name: string,
    public storageKey?: string,
    /**
     * 当前启用的等级
     * 如果设置为 Silent 则不输出任何日志
     * 只有大于等于当前等级的日志才会输出
     */
    public level = Level.Debug,
    public onLog: OnLog = _.noop,
  ) {
    this.level = this.getStorageLevel() ?? level;
  }

  private getStorageLevel() {
    if (this.storageKey) {
      const state = store2.get(this.storageKey) as StorageState;
      return state?.[this.name];
    }
  }
  private setStorageLevel(level: Level) {
    if (this.storageKey) {
      const state = store2.get(this.storageKey) as StorageState;
      store2.set(this.storageKey, { ...state, [this.name]: level });
    }
  }
  setLevel(level: Level) {
    this.level = level;
    this.setStorageLevel(level);
  }
  enable() {
    this.setLevel(Level.Debug);
  }
  disable() {
    this.setLevel(Level.Error);
  }

  // 是否应该输出日志
  private shouldLog(level: Level) {
    return level >= this.level;
  }

  private combineArgs(level: Level, tag: string, args: any[]): OnLogParams {
    const data = {
      name: this.name,
      level,
      msg: args,
      tag,
      time: Date.now(),
      shouldLog: this.shouldLog(level),
    };
    return data;
  }
  private formatArgs(data: OnLogParams) {
    const time = new Date(data.time).toLocaleTimeString("zh-CN");
    const prefix = `[${time}] ${data.tag} ${data.name}: `;

    const first = data.msg[0];

    if (typeof first === "string") {
      // 确保 %o %O 等占位符正常工作
      return [`${prefix}${first}`, ...data.msg.slice(1)];
    }
    return [`${prefix}`, ...data.msg];
  }

  debug(...args: any[]) {
    const data = this.combineArgs(Level.Debug, "DEBUG", args);
    this.onLog(data);
    if (data.shouldLog) {
      console.debug(...this.formatArgs(data));
    }
  }
  info(...args: any[]) {
    const data = this.combineArgs(Level.Info, "INFO", args);
    this.onLog(data);
    if (data.shouldLog) {
      console.log(...this.formatArgs(data));
    }
  }
  warn(...args: any[]) {
    const data = this.combineArgs(Level.Warn, "WARN", args);
    this.onLog(data);
    if (data.shouldLog) {
      console.warn(...this.formatArgs(data));
    }
  }
  error(...args: any[]) {
    const data = this.combineArgs(Level.Error, "ERROR", args);
    this.onLog(data);
    if (data.shouldLog) {
      console.error(...this.formatArgs(data));
    }
  }
}
