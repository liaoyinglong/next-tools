export * from "../factory/createStateContext";
export * from "../factory/mapProps";
export * from "../i18n";
export * from "../numbro";
export * from "../rq/RequestBuilder";
export * from "../rq/defaultQueryClient";
export * from "../storage";
export * from "../storage/cookie";

if (process.env.NODE_ENV === "development") {
  console.trace(
    [
      `下个版本将移除barrel文件，使用单独的导出文件。`,
      "修改 `import {} from '@dune2/tools'` 为 `import {} from '@dune2/tools/xxx'` ",
    ].join("\n")
  );
}
