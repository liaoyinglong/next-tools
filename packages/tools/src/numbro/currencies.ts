import { LocalesEnum } from "../../i18n";
import { CurrencyFormat } from "./shared";

export const defaultCurrencies: Record<
  string,
  Omit<CurrencyFormat, "locale">
> = {
  [LocalesEnum.en]: {
    symbol: "$",
    position: "prefix",
    mantissa: 2,
  },
  [LocalesEnum.id]: {
    symbol: "Rp",
    position: "prefix",
    mantissa: 2,
  },
  [LocalesEnum.zh]: {
    symbol: "¥",
    position: "prefix",
    mantissa: 2,
  },
};
