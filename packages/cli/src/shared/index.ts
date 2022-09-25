import cac from "cac";
import debug from "debug";

export const cli = cac("qwer");

export const createLogger = (name: string) => {
  const info = debug(`${cli.name}:${name}`);
  return {
    ...info,
    info,
    error: info.extend("error"),
  };
};
debug.enable(`${cli.name}:*`);
