import { existsSync } from 'node:fs';
import path from 'path';
import { createJiti } from 'jiti';
import { normalizeConfig } from './normalizeConfig';
import { Config } from './types';

export * from './types';

export function defineConfig<T extends Config = Config>(c: T) {
  return c;
}

export const configName = 'dune.config.ts';

export async function getConfig(): Promise<Config> {
  const cwd = process.cwd();

  if (!existsSync(path.join(cwd, configName))) {
    console.warn(`can not find config file: ${configName} in ${cwd}`);
    console.warn(`please run "dune init" to create config file`);
    return normalizeConfig({});
  }

  // 配置文件存在时，加载错误（如语法错误）应当抛出而不是被吞掉
  const jiti = createJiti(cwd);
  const res = await jiti.import<Config>(`./${configName}`, {
    default: true,
  });

  return normalizeConfig(res);
}
