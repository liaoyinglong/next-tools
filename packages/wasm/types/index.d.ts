export interface ExtractedItem {
  id: string;
  messages: string;
  column: number;
  line: number;
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

export function autoNamespaceSync(
  source: string,
  namespace: string,
  separator: string
): string;

export function autoNamespace(
  source: string,
  namespace: string,
  // TODO: 待实现
  separator: string
): Promise<string>;
