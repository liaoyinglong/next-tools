import { i18n, LocalesEnum } from "../../src/i18n";
import { compileMessages } from "../../src/i18n/compile";

export const enMessage = {
  hello: "hello",
  "hello {name}": "hello {name}",
  "hello <0>{name}</0>": "hello <0>{name}</0>",
  error_221040: "Nama variabel sudah ada: {0}",
  error_221041: "Variabel belum didefinisikan: {0}",
};
export const zhMessage = {
  hello: "你好",
  "hello {name}": "你好 {name}",
  "hello <0>{name}</0>": "你好 <0>{name}</0>",
  error_221040: "变量名已存在：{0}",
  error_221041: "未定义的变量：{0}",
};

export function registerDefaultMessage() {
  i18n.register(LocalesEnum.en, compileMessages(enMessage));
  i18n.register(LocalesEnum.zh, compileMessages(zhMessage));
}

export function registerDefaultAsyncMessage() {
  i18n.register(LocalesEnum.en, async () => compileMessages(enMessage));
  i18n.register(LocalesEnum.zh, async () => compileMessages(zhMessage));
}
