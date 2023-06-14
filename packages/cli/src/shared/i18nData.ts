import pMap from "p-map";
import { I18nConfig } from "./config";
import { createLogger } from "./index";
import fs from "fs-extra";
import pc from "picocolors";
import path from "path";
import Table from "cli-table3";
import { SheetData } from "./resolveSheetData";
import { sleep } from "./sleep";

const log = createLogger("i18nData");
export type ExtractedMap = Map<
  string,
  { id: string; messages: string; files: string[] }
>;

export class I18nData {
  data: Record<string, string> = {};

  filePath: string;

  /**
   * 是否是默认语言，默认语言需要使用提出来的文案作为value
   */
  isDefaultLocale: boolean;
  // 没有被使用到的翻译key
  unUsedKeys: Set<string> = new Set();
  constructor(
    public locale: string,
    public config: I18nConfig,
    // 是否需要删除未使用的文案
    public shouldDeleteUnused = false
  ) {
    this.isDefaultLocale = locale === config.defaultLocale;
    this.filePath = path.join(
      config.cwd!,
      config.i18nDir!,
      config.i18nFileName!.replace("{locale}", locale)
    );
  }

  async loadData() {
    try {
      if (await fs.pathExists(this.filePath)) {
        this.data = await fs.readJSON(this.filePath);
      } else {
        log.info("File '%s' does not exist", pc.dim(this.filePath));
      }
    } catch (e) {
      log.error(
        "Error loading i18n data for locale '%s' from file '%s'",
        pc.yellow(this.locale),
        pc.yellow(this.filePath)
      );
      log.error("Error: %s", e.message);
    }
    return this.data;
  }

  /**
   * @param {ExtractedMap} extractedData 提取出来的内容
   */
  async updateByExtractedData(extractedData: ExtractedMap) {
    const oldData = await this.loadData();
    let newData = {};
    extractedData.forEach((value, key) => {
      let newValue = oldData[key] || "";
      if (this.isDefaultLocale) {
        // 默认语言需要回退到key作为value
        newValue = newValue || value.messages || key;
        //#region 对namespace的支持
        newValue = this.normalizeNamespacedDefaultLocaleData(newValue);
        //#endregion
      }
      newData[key] = newValue;
    });
    if (!this.shouldDeleteUnused) {
      // 不删除未使用的文案，则需要合并旧数据
      newData = { ...oldData, ...newData };
    }
    this.data = newData;

    // 记录下来未被使用的key，后面需要打印出来提示用户
    Object.keys(oldData).forEach((key) => {
      if (!extractedData.has(key)) {
        this.unUsedKeys.add(key);
      }
    });
  }

  private namespaceReg: RegExp;
  /**
   * 如果是默认语言，开启了 namespace的话
   * 提取出来的 文案 是 `模块名.文案` 的形式
   * 在这里需要把 `模块名.` 去掉
   */
  private normalizeNamespacedDefaultLocaleData(v: string) {
    if (!this.namespaceReg && this.config.namespace) {
      const names = Object.keys(this.config.namespace).join("|");
      const separator = this.config.namespaceSeparator;
      this.namespaceReg = new RegExp(`^(${names})\\${separator}`);
    }
    if (this.namespaceReg) {
      return v.replace(this.namespaceReg, "");
    }
    return v;
  }

  async updateFromSheetData(sheetData: Record<string, string>) {
    await this.loadData();
    this.data = { ...this.data, ...sheetData };
  }

  private sortData() {
    //region 语言key按一定规则排序
    const keys = Object.keys(this.data).sort(this.config.keySorter);
    const newData = {};
    keys.forEach((key) => {
      newData[key] = this.data[key];
    });
    this.data = newData;
    //endregion
  }

  async saveToDisk() {
    this.sortData();
    log.info(
      "Saving i18n data for locale '%s' to file '%s'",
      pc.green(this.locale),
      pc.dim(this.filePath)
    );
    try {
      await fs.ensureFile(this.filePath);
      await fs.writeJson(this.filePath, this.data, { spaces: 2 });
      log.info(
        "Saved i18n data for locale '%s' to file '%s'",
        pc.green(this.locale),
        pc.dim(this.filePath)
      );
    } catch (e) {
      log.error(
        "Error saving i18n data for locale '%s' to file '%s'",
        pc.green(this.locale),
        pc.dim(this.filePath)
      );
      log.error("Error: %s", pc.red(e.message));
    }
  }

  async trySaveToGoogle(sheetData: SheetData) {
    await pMap(
      Object.entries(this.data),
      async ([key, value]) => {
        if (sheetData.hasI18nItem(this.locale, key)) {
          // 更新已有的
          await sheetData.getI18nItem(this.locale, key)?.tryUpdate(value);
          // 避免频繁请求，Google sheet api 默认限制
          // • 每秒钟读操作数：100 请求/秒
          // • 每秒钟单元格写操作数：100 请求/秒
          await sleep(500);
        } else {
          log.error(
            "%s range %s not found key %s",
            pc.bold(this.config.sheetRange),
            pc.bold(this.locale),
            pc.bold(key)
          );
        }
      },
      { concurrency: 50 }
    );
  }
  private statistic() {
    const total = Object.keys(this.data).length;
    const missing = Object.values(this.data).filter((v) => !v).length;

    return {
      locale: this.locale,
      total,
      missing,
    };
  }
  static printStatistic(label: string, i18nDataArr: I18nData[]) {
    // 首先打印 unUsedKeys
    const unUsedKeys = i18nDataArr.reduce((keys, item) => {
      return new Set(item.unUsedKeys);
    }, new Set<string>());
    if (unUsedKeys.size) {
      console.log(
        pc.bold(
          `共有 ${pc.green(
            unUsedKeys.size
          )} 个 key 未在代码中使用，以下是具体的 key`
        )
      );
      console.log(
        pc.red(
          "注意：这些key可能是已经删除的代码，也可能是通过 `t.ignoreExtract` 调用忽略了提取 并不一定是冗余的 key"
        )
      );
      console.table(unUsedKeys);
    }
    // 打印提取出来的翻译文案统计
    const table = new Table({
      head: ["Language", "Total count", "Missing"],
      colAligns: ["left", "center", "center"],
      style: {
        head: ["green"],
        border: [],
        compact: true,
      },
    });

    i18nDataArr.forEach((i18nData) => {
      const statistic = i18nData.statistic();
      table.push([
        statistic.locale,
        statistic.total,
        statistic.missing > 0 ? pc.red(statistic.missing) : statistic.missing,
      ]);
    });
    console.log(pc.bold(label));
    console.log(table.toString());
  }
}
