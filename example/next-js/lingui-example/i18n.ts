import { i18n } from "@scope/i18n";
import { en, cs } from "make-plural/plurals";

i18n.loadLocaleData("en", { plurals: en });
i18n.loadLocaleData("cs", { plurals: cs });

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function activate(locale: string) {
  const messages = await import(`../locale/${locale}.locale.json`);
  i18n.load(locale, messages.default);
  i18n.activate(locale);
}
