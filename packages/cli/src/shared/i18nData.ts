import pMap from "p-map";
import { I18nConfig } from "./config";
import { createLogger } from "./index";
import fs from "fs-extra";
import pc from "picocolors";
import path from "path";
import Table from "cli-table3";
import { SheetData } from "./resolveSheetData";

const log = createLogger("i18nData");
export type ExtractedMap = Map<string, { id: string; messages: string }>;

export class I18nData {
  data: Record<string, string> = {};

  filePath: string;

  /**
   * 是否是默认语言，默认语言需要使用提出来的文案作为value
   */
  isDefaultLocale: boolean;
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
      }
      newData[key] = newValue;
    });
    if (!this.shouldDeleteUnused) {
      // 不删除未使用的文案，则需要合并旧数据
      newData = { ...oldData, ...newData };
    }
    this.data = newData;
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
    await pMap(Object.entries(this.data), async ([key, value]) => {
      if (sheetData.hasI18nItem(this.locale, key)) {
        // 更新已有的
        await sheetData.getI18nItem(this.locale, key)?.tryUpdate(value);
      } else {
        log.error(
          "%s range %s not found key %s",
          pc.bold(this.config.sheetRange),
          pc.bold(this.locale),
          pc.bold(key)
        );
      }
    });
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
