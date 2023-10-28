import { createUnplugin } from "unplugin";
import compile from "./compile";

/**
 * 后续翻译从云端获取后
 * 就需要将预编译的动作集成在运行时的代码中
 */
export const i18nResourcePlugin = createUnplugin((options: unknown) => {
  return {
    name: "i18nResource",
    // webpack's id filter is outside of loader logic,
    // an additional hook is needed for better perf on webpack
    transformInclude(id) {
      return id.endsWith(".i18n.json");
    },
    // just like rollup transform
    transform(code) {
      try {
        const data = JSON.parse(code);
        Object.keys(data).forEach((key) => {
          data[key] = compile(data[key] || key);
        });
        return JSON.stringify(data);
      } catch (e) {
        this.error(`解析json文件失败 ${e.message}`);
        return code;
      }
    },
    // more hooks coming
  };
});
