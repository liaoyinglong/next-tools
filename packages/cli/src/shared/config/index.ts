import JoyCon from "joycon";
import { Config } from "./types";
import { normalizeConfig } from "./normalizeConfig";

export * from "./types";

const joycon = new JoyCon();

export function defineConfig<T extends Config = Config>(c: T) {
  return c;
}

export const configName = "dune.config.js";

export async function getConfig(): Promise<Config> {
  const res = await joycon.load([configName]);
  return normalizeConfig(res.data ?? {});
}
