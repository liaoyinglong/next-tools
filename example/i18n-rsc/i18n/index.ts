import { i18n } from "@dune2/tools/i18n/duneI18n.ts";
import { LocalesEnum } from "@dune2/tools/i18n/enums.ts";

i18n.register(LocalesEnum.en, [require("./en.i18n.json")]);
i18n.register(LocalesEnum.zh, [require("./zh.i18n.json")]);
i18n.updateConfig({
  defaultLocale: LocalesEnum.en,
  storageKey: "i18n",
  supportedLocales: [LocalesEnum.en, LocalesEnum.zh],
  detectFromPath: true,
  // debug: true,
});
i18n.activate({
  syncToStorage: false,
  locale: LocalesEnum.en,
});

// 从这里 import 的 i18n 是已经配置好相关参数的 i18n
export { i18n };
