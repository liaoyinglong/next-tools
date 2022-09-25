export interface Config {}

export function defineConfig(config: Config) {
  return config;
}

export interface InternalConfig extends Config {
  cwd: string;
}
export async function getConfig(): Promise<InternalConfig> {
  return {
    cwd: process.cwd(),
  };
}
