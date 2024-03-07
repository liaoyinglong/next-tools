import _ from "lodash";
import { Level } from "./shared";

type OnLogParams = {
  // 日志等级
  level: Level;
  // 可读的日志等级
  tag: string;
  // 用于标识日志的名称
  name: string;
  // 日志输出时间
  time: number;
  // 是否应该输出日志
  shouldLog: boolean;
  // 日志内容
  msg: any[];
};

export type OnLog = (data: OnLogParams) => void;

export class Logger {
  constructor(
    public name: string,
    /**
     * 当前启用的等级
     * 如果设置为 Silent 则不输出任何日志
     * 只有大于等于当前等级的日志才会输出
     */
    public level = Level.Debug,
    public onLog: OnLog = _.noop,
  ) {}
  setLevel(level: Level) {
    this.level = level;
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
    const time = new Date(data.time).toLocaleTimeString();
    return [`[${time}] ${data.tag} ${data.name}: `, ...data.msg];
  }

  debug(...args: any[]) {
    const data = this.combineArgs(Level.Debug, "DEBUG", args);
    this.onLog(data);
    if (data.shouldLog) {
      const callSite =
        process.env.NODE_ENV === "development"
          ? "\n" + new Error().stack!.split("\n")[2].trim()
          : undefined;
      console.debug(...this.formatArgs(data), callSite);
    }
  }
  info(...args: any[]) {
    const data = this.combineArgs(Level.Info, "INFO", args);
    this.onLog(data);
    if (data.shouldLog) {
      const callSite =
        process.env.NODE_ENV === "development"
          ? "\n" + new Error().stack!.split("\n")[2].trim()
          : undefined;
      console.log(...this.formatArgs(data), callSite);
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
      console.warn(...this.formatArgs(data));
    }
  }
}
