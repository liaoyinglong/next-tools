import cac from "cac";
import debug from "debug";

export const cli = cac("qwer");

export const createLogger = (name: string) => {
  return debug(`${cli.name}:${name}`);
};
