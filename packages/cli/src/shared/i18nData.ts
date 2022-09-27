import { InternalConfig } from "./config";
import { createLogger } from "./index";
import fs from "fs-extra";
import pc from "picocolors";
import path from "path";
const log = createLogger("i18nData");
export type ExtractedMap = Map<string, { id: string; defaults: string }>;

export class I18nData {
  private data: Record<string, string> = {};

  filePath: string;

  constructor(public locale: string, public config: InternalConfig) {
    this.filePath = path.join(
      config.cwd,
      config.i18nDir,
      config.i18nFileName.replace("{locale}", locale)
    );
  }

  private async loadData() {
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

  async updateByExtractedData(
    extractedData: ExtractedMap,
    shouldUseDefault = false
  ) {
    await this.loadData();
    extractedData.forEach((value, key) => {
      this.data[key] = shouldUseDefault
        ? value.defaults || key
        : this.data[key] || "";
    });
  }

  private sortData() {
    //region 语言key按一定规则排序
    const keys = Object.keys(this.data).sort((a, b) => {
      return a.localeCompare(b);
    });
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

  async statistic() {
    const total = Object.keys(this.data).length;
    const missing = Object.values(this.data).filter((v) => !v).length;

    return {
      locale: this.locale,
      total,
      missing,
    };
  }
}
