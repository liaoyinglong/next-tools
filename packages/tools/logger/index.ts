import _ from "lodash";
import { Logger } from "./Logger";
import { Level } from "./shared";

interface Config<Name extends string = string> {
  loggers: Name[];
  level?: Level;
  onLog?: (data: {
    level: Level;
    msg: any[];
    tag: string;
    time: number;
  }) => void;
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
    const logger = new Logger(name, config.level ?? Level.Debug, config.onLog);
    // 输入：foo.login
    // 输出：fooLogin
    const key = _.camelCase(name) as Key;
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

const logger = createLogger({
  loggers: ["foo", "foo.login", "bar"],
  onLog: (data) => {
    console.log("onLog", data);
  },
});

console.log(logger);

logger.foo.debug("1");
logger.foo.info(
  "23123131213123213213122dsadasdsadsafdgewgewgew gfew  gew gewgwegew gewgew ewgewf ewr ew   ",
);
logger.foo.warn("3");
logger.foo.error("4");
