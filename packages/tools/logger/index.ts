import _ from "lodash";
import { Logger, type OnLog } from "./Logger";
import { Level } from "./shared";

interface Config<Name extends string = string> {
  // 创建的 logger 名称
  loggers: Name[];
  // 默认日志级别
  level?: Level;
  // 日志回调，用于上报日志
  onLog?: OnLog;
  // 存储到本地的 key，用于存储日志级别
  storageKey?: string;
}

type NormalizeName<T extends string> = T extends `${infer A}.${infer B}`
  ? `${A}${Capitalize<NormalizeName<B>>}`
  : T;

export function createLogger<Name extends string>(config: Config<Name>) {
  type Key = NormalizeName<Name>;

  // 内置关键字
  const keywords = ["debug", "info", "warn", "error", "enable", "disable"];

  const loggerMap = {} as Record<Key, Logger>;
  config.loggers.forEach((name) => {
    if (keywords.includes(name)) {
      throw new Error(`logger name can't be ${name}`);
    }
    // 输入：foo.login
    // 输出：fooLogin
    const key = (name.includes(".") ? _.camelCase(name) : name) as Key;

    if (loggerMap[key]) {
      throw new Error(`logger name "${name}" is duplicated`);
    }

    const logger = new Logger(
      name,
      config.storageKey,
      config.level ?? Level.Debug,
      config.onLog,
    );
    loggerMap[key] = logger;
  });

  const method = {
    enable() {
      _.forEach(loggerMap, (v) => {
        v.enable();
      });
    },
    disable() {
      _.forEach(loggerMap, (v) => {
        v.disable();
      });
    },
    setLevel(level: Level) {
      _.forEach(loggerMap, (v) => {
        v.setLevel(level);
      });
    },
  };

  return {
    ...method,
    ...loggerMap,
  };
}
