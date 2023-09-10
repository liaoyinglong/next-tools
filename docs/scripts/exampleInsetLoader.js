const fs = require("fs/promises");
const path = require("path");

const logEnabled = false;
const log = (...args) => {
  if (logEnabled) {
    console.log(`[exampleInsetLoader]: `, ...args);
  }
};

/**
 * @param content {string}
 */
const exampleInsetLoader = async function (content) {
  try {
    const callback = this.async();
    const dirname = this.context;

    const matched = content.matchAll(reg);
    const filesMap = {};
    await Promise.all(
      [...matched].map(async (v) => {
        const [match, p1] = v;
        const examplePath = path.resolve(dirname, p1);
        log("examplePath", examplePath);

        const fileNames = await fs.readdir(examplePath);
        const files = {};

        await Promise.all(
          fileNames.map(async (file) => {
            const s = await fs.readFile(
              path.resolve(examplePath, file),
              "utf-8"
            );
            files[`/${file}`] = s;
          })
        );
        filesMap[match] = files;
      })
    );
    const newContent = replaceWithExample(content, (match, p1) => {
      const files = filesMap[match];
      return `# Example

import { LiveCode } from "@/components/LiveCode";

<LiveCode
  files={${JSON.stringify(files, null, 2)}}
/>`;
    });
    log(`newContent`, newContent);
    callback(null, newContent);
  } catch (e) {
    console.error("exampleInsetLoader error, fall back to default");
    console.log(e);
    return content;
  }
};

const reg = /<emaple-inset>([\s\S]*?)<\/emaple-inset>/g;

/**
 *
 * @param str {string}
 * @param cb {(match: string, p1: string) => string}
 */
function replaceWithExample(str, cb) {
  return str.replaceAll(reg, (match, p1) => {
    return cb(match, p1);
  });
}

module.exports = exampleInsetLoader;
module.exports.replaceWithExample = replaceWithExample;
