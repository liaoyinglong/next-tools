import store2 from "store2";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../../logger/Logger";
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

  it("should construct with default values", () => {
    const logger = new Logger("test");
    expect(logger.name).toBe("test");
    expect(logger.level).toBe(Level.Debug);
  });

  it("level work", () => {
    const logger = new Logger("test", storageKey, Level.Debug);
    expect(logger.level).toBe(Level.Debug);

    logger.setLevel(Level.Info);
    expect(logger.level).toBe(Level.Info);

    // check storage
    expect(store2.get(storageKey)).toEqual({
      [logger.name]: Level.Info,
    });
  });

  it("load level from storage", () => {
    store2.set(storageKey, { test: Level.Warn });
    const logger = new Logger("test", storageKey, Level.Debug);
    expect(logger.level).toBe(Level.Warn);
  });

  it("level control work", () => {
    const logger = new Logger("test", storageKey, Level.Silent);
    const doLog = () => {
      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");
    };
    doLog();
    expect(logsSpy.debug).toBeCalledTimes(0);
    expect(logsSpy.log).toBeCalledTimes(0);
    expect(logsSpy.warn).toBeCalledTimes(0);
    expect(logsSpy.error).toBeCalledTimes(0);

    logger.setLevel(Level.Error);
    doLog();
    expect(logsSpy.debug).toBeCalledTimes(0);
    expect(logsSpy.log).toBeCalledTimes(0);
    expect(logsSpy.warn).toBeCalledTimes(0);
    expect(logsSpy.error).toBeCalledTimes(1);

    logger.setLevel(Level.Warn);
    doLog();
    expect(logsSpy.debug).toBeCalledTimes(0);
    expect(logsSpy.log).toBeCalledTimes(0);
    expect(logsSpy.warn).toBeCalledTimes(1);
    expect(logsSpy.error).toBeCalledTimes(2);

    logger.setLevel(Level.Info);
    doLog();
    expect(logsSpy.debug).toBeCalledTimes(0);
    expect(logsSpy.log).toBeCalledTimes(1);
    expect(logsSpy.warn).toBeCalledTimes(2);
    expect(logsSpy.error).toBeCalledTimes(3);

    logger.setLevel(Level.Debug);
    doLog();
    expect(logsSpy.debug).toBeCalledTimes(1);
    expect(logsSpy.log).toBeCalledTimes(2);
    expect(logsSpy.warn).toBeCalledTimes(3);
    expect(logsSpy.error).toBeCalledTimes(4);
  });
});
