import { I18nConfig } from "./config";
import { googleSheet } from "./google/sheet";
import { createLogger } from "./index";
import { letterToNumber } from "./letters";

const log = createLogger("shared:resolveSheetData");

class SheetI18nItem {
  value: string;

  colIndex: number;

  constructor(
    private spreadsheetId: string,
    private range: string,
    public key: string,
    colIndex: number | string,
    public row: string[],
    private rowIndex: number
  ) {
    this.colIndex = letterToNumber(colIndex);
    // TODO: 待确定 无值的key是否要生成
    // value = undefined 即不会生成
    this.value = this.row[this.colIndex] || "";
  }

  /**
   * 尝试更新 单元格的值
   * 如果一样则不更新
   */
  async tryUpdate(newValue: string) {
    if (newValue === this.value) {
      // 云端的值跟本地一样 不需要同步
      return;
    }

    await googleSheet.updateCell(
      this.spreadsheetId,
      this.range,
      this.colIndex,
      this.rowIndex,
      newValue
    );
  }
}

export async function resolveSheetData(config: I18nConfig): Promise<SheetData> {
  const { position } = config;
  const parseStartIndex = config.parseStartIndex ?? 2;

  log.info(`读取 ${config.sheetRange} sheet数据`);

  const res = await googleSheet.get({
    spreadsheetId: config.sheetId,
    range: config.sheetRange,
  });
  if (!res.data.values) {
    log.error(
      `${config.sheetRange} sheet数据为空，请检查，应该最少有一行头部数据`
    );
    return new SheetData(config, 2);
  }

  const sheetData = new SheetData(config, res.data.values.length + 1);

  res.data.values.forEach((row: string[], rowIndex) => {
    //  excel 的开始索引是1，所以要 +1
    const trulyRowIndex = rowIndex + 1;
    if (parseStartIndex > trulyRowIndex) {
      // 还未到可以开始解析的行数
      return;
    }

    const i18nKey = row[letterToNumber(position!.key)];

    if (i18nKey) {
      if (sheetData.keySet.has(i18nKey)) {
        log.error(
          `表格 ${config.sheetRange} 发现重复的i18nKey: ${i18nKey}, 将覆盖前面的值`
        );
      } else {
        sheetData.keySet.add(i18nKey);
      }

      config.locales?.forEach((lang) => {
        sheetData.setI18nItem(
          lang,
          new SheetI18nItem(
            config.sheetId!,
            config.sheetRange!,
            i18nKey,
            position![lang],
            row,
            trulyRowIndex
          )
        );
      });
    }
  });

  return sheetData;
}

export class SheetData {
  keySet = new Set<string>();

  constructor(
    private config: I18nConfig,
    // 当前有多少行 新增的时候往后面添加
    public nextAppendRowIndex: number
  ) {}

  private value = new Map(
    this.config.locales!.map((lang) => {
      return [lang, new Map<string, SheetI18nItem>()];
    })
  );

  getI18nItem(lang: string, i18nKey: string) {
    return this.value.get(lang)!.get(i18nKey);
  }

  setI18nItem(lang: string, i18nItem: SheetI18nItem) {
    this.value.get(lang)!.set(i18nItem.key, i18nItem);
  }

  hasI18nItem(lang: string, i18nKey: string) {
    return this.value.get(lang)!.has(i18nKey);
  }

  getLangDataJSON(lang: string) {
    const res = {} as Record<string, string>;
    this.value.get(lang)!.forEach((i18nItem) => {
      res[i18nItem.key] = i18nItem.value;
    });
    return res;
  }
}
