/**
 * input:
 *      "https://docs.google.com/spreadsheets/d/1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk/edit#gid=1740568548"
 * output:
 *      "1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk"
 * --
 * input: "1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk"
 * output: "1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk"
 */
import { match } from "path-to-regexp";

export function resolveSheetId(str?: string) {
  if (!str || !str?.startsWith("http")) {
    return str;
  }
  const url = new URL(str);
  const matched = match<{ id: string[] }>("/spreadsheets/d/:id*", {
    decode: decodeURIComponent,
  })(url.pathname);
  return matched ? matched.params.id?.[0] : str;
}
