import { createLogger } from ".";
import * as child_process from "child_process";

const log = createLogger("generateApi");

export function formatFile(filename: string) {
  // 格式化代码
  log.info(`尝试格式化代码: %s`, filename);
  child_process.exec(`prettier --write ${filename}`, (error) => {
    if (error) {
      log.error(`格式化代码失败: ${error}`);
      log.error(`请手动执行: prettier --write ${filename}`);
      log.error(`或者在配置文件中关闭格式化功能`);
    } else {
      log.info(`格式化代码成功: %s`, filename);
    }
  });
}
