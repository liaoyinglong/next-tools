export interface ExtractedItem {
  id: string;
  messages: string;
}

export interface Extracted {
  data: Map<string, ExtractedItem>;
  filename: string;
  errMsg: string;
}

export function extractSync(source: string, filename: string): Extracted;
/**
 * @param {string} source
 * @param {string} filename
 * @returns {Promise<any>}
 */
export function extract(source: string, filename: string): Promise<Extracted>;
