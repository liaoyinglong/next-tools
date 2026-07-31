import fs from 'node:fs/promises';
import path from 'path';
import { createLogger } from '../shared';
import { configName } from '../shared/config';

const log = createLogger('initConfig');

const tpl = `\
import { defineConfig } from "@dune2/cli";

export default defineConfig({
  api: [],
});`;

export const initConfig = async () => {
  const configPath = path.join(process.cwd(), configName);
  log.info(`config file path: ${configPath}`);
  if (
    await fs
      .access(configPath)
      .then(() => true)
      .catch(() => false)
  ) {
    log.info(`config file already exists, skip`);
    return;
  }
  await fs.writeFile(configPath, tpl);
  log.info(`config file created`);
};
