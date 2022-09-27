import { createLogger } from "../shared";
import { getConfig, configName } from "../shared/config";
import fs from "fs-extra";
import path from "path";

const log = createLogger("initConfig");

const tpl = `
/**
 * @type {import('@dune/cli').Config}
 */
module.exports = {}
`;

export const initConfig = async () => {
  const config = await getConfig();
  const configPath = path.join(config.cwd, configName);
  log.info(`config file path: ${configPath}`);

  if (await fs.pathExists(configPath)) {
    log.info(`config file already exists, skip`);
    return;
  }
  await fs.writeFile(configPath, tpl);
  log.info(`config file created`);
};
