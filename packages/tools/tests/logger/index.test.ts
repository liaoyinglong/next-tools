import store2 from "store2";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "../../logger";
import { Level } from "../../logger/shared";

const storageKey = "storageKey";

const logsSpy = {
  log: vi.spyOn(console, "log"),
  warn: vi.spyOn(console, "warn"),
  error: vi.spyOn(console, "error"),
  debug: vi.spyOn(console, "debug"),
};

describe("Logger", () => {
  beforeEach(() => {
    logsSpy.error.mockReset();
    logsSpy.warn.mockReset();
    logsSpy.log.mockReset();
    logsSpy.debug.mockReset();
  });
  afterEach(() => {
    store2.clearAll();
  });

 it("should create correct loggers", () => {
   const logger = createLogger({
     loggers: [
       // 只对 . 分割符生效
       "foo.bar",
       // 保留原样
       "BaseTV",
       // 首字母大写
       "Area",
       "foo",
     ],
   });

   expect(logger.foo).toBeTruthy();
   expect(logger.fooBar).toBeTruthy();
   expect(logger.BaseTV).toBeTruthy();
   expect(logger.Area).toBeTruthy();
 });


  it("should save level to storage", () => {
    const logger = createLogger({
      loggers: ["foo", "foo.bar"],
      storageKey,
      level: Level.Silent,
    });

    expect(store2.get(storageKey)).toBeFalsy();

    logger.foo.setLevel(Level.Debug);
    expect(store2.get(storageKey)).toEqual({ foo: Level.Debug });

    logger.fooBar.setLevel(Level.Warn);
    expect(store2.get(storageKey)).toEqual({
      foo: Level.Debug,
      "foo.bar": Level.Warn,
    });
  });

  it("should enable and disable", () => {
    const logger = createLogger({
      loggers: ["foo", "foo.bar"],
      storageKey,
      level: Level.Silent,
    });

    logger.foo.debug("foo debug");
    expect(logsSpy.debug).toBeCalledTimes(0);

    logger.enable();
    logger.foo.debug("foo debug");
    expect(logsSpy.debug).toBeCalledTimes(1);

    logger.disable();
    logger.foo.debug("foo debug");
    expect(logsSpy.debug).toBeCalledTimes(1);
  });

  it("onLog", () => {
    const onLog = vi.fn();
    const logger = createLogger({
      loggers: ["foo", "foo.bar"],
      storageKey,
      level: Level.Silent,
      onLog,
    });

    logger.foo.debug("foo debug");
    expect(onLog).toBeCalledTimes(1);
    expect(onLog.mock.lastCall).toMatchObject([
      {
        level: Level.Debug,
        name: "foo",
        tag: "DEBUG",
        msg: ["foo debug"],
        shouldLog: false,
      },
    ]);

    logger.enable();
    logger.foo.debug("foo debug");
    expect(onLog).toBeCalledTimes(2);

    expect(onLog.mock.lastCall).toMatchObject([
      {
        level: Level.Debug,
        name: "foo",
        tag: "DEBUG",
        msg: ["foo debug"],
        shouldLog: true,
      },
    ]);
  });
});
