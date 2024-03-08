export enum Level {
  Debug,
  Info,
  Warn,
  Error,
  Silent,
}


export type OnLogParams = {
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