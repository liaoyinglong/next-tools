import { GaxiosResponse } from "gaxios";
import type { sheets_v4 } from "googleapis";
import { google } from "googleapis";
import { createLogger } from "../index";
import { numberToLetter } from "../letters";
import { googleAuth } from "./auth";

const log = createLogger("google:sheets");

class GoogleSheet {
  private sheets: sheets_v4.Sheets;

  private initPromise: Promise<void> | null = null;
  private async initImpl() {
    if (!this.sheets) {
      await googleAuth.initCredentials();
      this.sheets = google.sheets({
        version: "v4",
        auth: googleAuth.oauth2Client,
      });
    }
  }
  /**
   * 调用sheets其他方法的时候需要先初始化
   */
  async init() {
    if (!this.initPromise) {
      this.initPromise = this.initImpl();
    }
    await this.initPromise;
  }

  get = async (options: sheets_v4.Params$Resource$Spreadsheets$Values$Get) => {
    await this.init();
    return this.sheets.spreadsheets.values.get(options);
  };

  private async update(
    spreadsheetId: string,
    range: string,
    colIndex: number,
    rowIndex: number,
    values: string[][]
  ): Promise<GaxiosResponse<sheets_v4.Schema$UpdateValuesResponse>> {
    await this.init();

    const colLetter = numberToLetter(colIndex);
    const sheetNeedRange = `${range}!${colLetter}${rowIndex}`;

    const res = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetNeedRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    if (res.status === 200) {
      log.info(`更新 ${sheetNeedRange} 的值成功`);
    } else {
      log.error("some thing wrong", res);
    }
    return res;
  }

  /**
   * 更新某一个单元格
   */
  async updateCell(
    spreadsheetId: string,
    range: string,
    colIndex: number,
    rowIndex: number,
    values: string
  ) {
    return this.update(spreadsheetId, range, colIndex, rowIndex, [[values]]);
  }

  /**
   * 更新某一列
   */
  async updateColumn(
    spreadsheetId: string,
    range: string,
    colIndex: number,
    rowIndex: number,
    values: string[]
  ) {
    return this.update(spreadsheetId, range, colIndex, rowIndex, [
      ...values.map((v) => [v]),
    ]);
  }
  /**
   * This method is used to get the titles of all the ranges in a Google Spreadsheet.
   *
   * @async
   * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
   * @returns {Promise<string[]>} - A promise that resolves to an array of titles of all the ranges in the Google Spreadsheet.
   * @throws {Error} - Throws an error if the initialization of the Google Sheets API client fails.
   */
  async getRangeTitles(spreadsheetId: string) {
    // Initialize the Google Sheets API client
    await this.init();
    // Get the details of the Google Spreadsheet
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });
    // Extract the titles of all the ranges in the Google Spreadsheet
    const titles = res.data.sheets
      ?.map((v) => v.properties?.title)
      .filter((v): v is string => !!v);

    return titles;
  }
}

export const googleSheet = new GoogleSheet();
