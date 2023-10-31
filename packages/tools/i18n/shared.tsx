import { LocalesEnum } from "./enums";

export interface Config {
  // 推导失败后的默认语言
  defaultLocale: LocalesEnum;
  /**
   * 存储的 key
   * @default dune-lang
   */
  storageKey: string;

  /**
   * url 参数
   * @default lang
   */
  queryKey: string;

  /**
   * 是否从 url 中获取语言 默认为 false
   * 在后管系统中，一般不需要
   */
  detectFromPath: boolean;

  /**
   * 用户可以额外设置，同时也会从已加载的语言包中获取
   */
  supportedLocales: string[];

  // [ 浏览器语言 , dune 语言 ]
  navigatorMapper: [string, string][];
}
