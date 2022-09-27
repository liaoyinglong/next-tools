import { createLogger } from "../shared";
import { getConfig, configName } from "../shared/config";
import fs from "fs-extra";
import path from "path";

const log = createLogger("initConfig");

const tpl = `
/**
 * @template {import('@dune2/cli').Config} T
 * @param {T | T[]} config - A generic parameter that flows through to the return type
 * @constraint {{import('@dune2/cli').Config}}
 */
function defineConfig(config) {
  return config;
}
module.exports = defineConfig([]);
`;

export const initConfig = async () => {
  const config = await getConfig();
  const configPath = path.join(config[0].cwd, configName);
  log.info(`config file path: ${configPath}`);
  if (await fs.pathExists(configPath)) {
    log.info(`config file already exists, skip`);
    return;
  }
  await fs.writeFile(configPath, tpl);
  log.info(`config file created`);
};
