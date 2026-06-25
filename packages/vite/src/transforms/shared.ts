import { Lang } from '@ast-grep/napi';

export const TRIGGER =
  /\b(?:createIsomorphicFn|createServerOnlyFn|createClientOnlyFn)\b/;

export function detectLang(filename: string): Lang {
  if (/\.(tsx|jsx)$/.test(filename)) return Lang.Tsx;
  if (/\.(m|c)?ts$/.test(filename)) return Lang.TypeScript;
  return Lang.JavaScript;
}
