import fs from "fs-extra";
import path from "path";
import { createLogger } from "../shared";
import { configName, getConfig } from "../shared/config";

const log = createLogger("initConfig");

const tpl = `\
import { defineConfig } from "@dune2/cli";

export default defineConfig({
  i18n: [],
  api: [],
});`;

export const initConfig = async () => {
  const config = await getConfig();
  const configPath = path.join(config.cwd!, configName);
  log.info(`config file path: ${configPath}`);
  if (await fs.pathExists(configPath)) {
    log.info(`config file already exists, skip`);
    return;
  }
  await fs.writeFile(configPath, tpl);
  log.info(`config file created`);
};
