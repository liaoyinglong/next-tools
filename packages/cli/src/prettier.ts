import { Plugin } from "prettier";
import { parsers as prettierParsers } from "prettier/parser-babel";
import { defaultJsonSorter } from "./shared/defaultJsonSorter";

const i18nJsonExt = ".i18n.json";

const jsonParser = prettierParsers.json;

// 配置 i18n.json
export const languages: Plugin["languages"] = [
  {
    name: "dune-i18n-json",
    parsers: ["json"],
    extensions: [i18nJsonExt],
  },
];

/**
 * 格式化 *.i18n.json 文件
 * 按照 key 排序
 * 对齐 cli 生成的 i18n.json 文件顺序
 * 方便查看和比较
 */
export const parsers: Plugin["parsers"] = {
  json: {
    ...jsonParser,
    preprocess(text, options) {
      if (jsonParser.preprocess) {
        text = jsonParser.preprocess(text, options);
      }
      const isI18nJson = options.filepath.endsWith(i18nJsonExt);
      if (isI18nJson) {
        try {
          let obj = JSON.parse(text);
          let newObj = defaultJsonSorter(obj);
          text = JSON.stringify(newObj, null, 2);
        } catch (error) {
          console.log(`JSON 格式错误：${error}`);
        }
      }
      return text;
    },
  },
};
