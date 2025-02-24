import { createJiti } from "jiti";
import { normalizeConfig } from "./normalizeConfig";
import { Config } from "./types";

export * from "./types";

export function defineConfig<T extends Config = Config>(c: T) {
  return c;
}

export const configName = "dune.config.ts";

export async function getConfig(): Promise<Config> {
  const cwd = process.cwd();
  const jiti = createJiti(cwd);

  const res = await jiti
    .import<Config>(`./${configName}`, {
      default: true,
    })
    .catch((err) => {
      console.warn(`can not find config file: ${configName} in ${cwd}`);
      return {};
    });

  return normalizeConfig(res);
}
