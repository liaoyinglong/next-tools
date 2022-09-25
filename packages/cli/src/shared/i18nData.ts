import { createLogger } from "./index";
import fs from "fs-extra";
const log = createLogger("i18nData");
export type ExtractedMap = Map<string, { id: string; defaults: string }>;

export class I18nData {
  private data: Record<string, string> = {};

  constructor(
    public locale: string,
    public extractedData: ExtractedMap,
    public filePath: string = `./i18n/${locale}.i18n.json`
  ) {}

  private async loadData() {
    try {
      this.data = await fs.readJSON(this.filePath);
    } catch (e) {
      log.error(
        "Error loading i18n data for locale '%s' from file '%s'",
        this.locale,
        this.filePath
      );
      log.error("Error: %s", e.message);
    }
    return this.data;
  }

  async saveToDisk(shouldUseDefault = false) {
    await this.loadData();
    this.extractedData.forEach((value, key) => {
      this.data[key] = shouldUseDefault
        ? value.defaults || key
        : this.data[key] || "";
    });
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

    log.info(
      "Saving i18n data for locale '%s' to file '%s'",
      this.locale,
      this.filePath
    );
    try {
      await fs.ensureFile(this.filePath);
      await fs.writeJson(this.filePath, this.data, { spaces: 2 });
      log.info(
        "Saved i18n data for locale '%s' to file '%s'",
        this.locale,
        this.filePath
      );
    } catch (e) {
      log.error(
        "Error saving i18n data for locale '%s' to file '%s'",
        this.locale,
        this.filePath
      );
      log.error("Error: %s", e.message);
    }
  }
}
