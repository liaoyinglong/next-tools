import cac from "cac";
import debug from "debug";
import path from "path";
import fs from "fs-extra";

export const cli = cac("dune");

export const createLogger = (name: string) => {
  const info = debug(`${cli.name}:${name}`);
  return {
    ...info,
    info,
    error: info.extend("error"),
  };
};

debug.enable(`${cli.name}:*`);

/**
 * same with chacheDir
 * homeDir();
 * //=> '~/name'
 *
 * homeDir('bar.js')
 * //=> '~/name/bar.js'
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const homeConfigDir = (() => {
  const isWin = process.platform === "win32";
  const USER_HOME_DIR = isWin ? process.env.USERPROFILE : process.env.HOME;
  const configDir = path.join(USER_HOME_DIR, ".config", cli.name);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  return homeConfigDir;

  function homeConfigDir(p?: string): string {
    if (!p) {
      return configDir;
    }
    return path.join(configDir, p);
  }
})();
