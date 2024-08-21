import babel, { parseAsync, traverse } from "@babel/core";
import File from "@babel/core/lib/transformation/file/file.js";
import PluginPass from "@babel/core/lib/transformation/plugin-pass.js";
import generate from "@babel/generator";
import * as fs from "fs/promises";
//const File = require("@babel/core/lib/transformation/file/file.js").default;
//const PluginPass =
//  require("@babel/core/lib/transformation/plugin-pass.js").default;

const getReactCompilerVisitor = (() => {
  //const reactCompilerConfig = require("./reactCompilerConfig");
  const reactCompilerConfig = {};

  const reactCompiler = require("babel-plugin-react-compiler").default(
    babel,
    reactCompilerConfig,
  );

  return (file: any) => {
    const pass = new PluginPass(file, reactCompiler.name, reactCompilerConfig);
    return traverse.visitors.merge([reactCompiler.visitor], [pass]);
  };
})();

export async function run(filename: string) {
  let source = await fs.readFile(filename, "utf8");

  let ast = await parseAsync(source, {
    filename: filename,
    plugins: [
      [
        "@babel/plugin-syntax-typescript",
        {
          isTSX: true,
        },
      ],
    ],
    sourceType: "module",
    sourceMaps: false,
  });
  if (!ast) {
    throw new Error(`Failed to parse file: ${filename}`);
  }
  const file = new File(
    { filename },
    {
      ast,
      code: source,
      inputMap: null,
    },
  );

  // must run react compiler at last
  traverse(ast, getReactCompilerVisitor(file));

  // generate output
  let res = generate(ast, { retainLines: true, filename: filename }, source);

  return {
    ...res,
    // 编译后会有 _c(2) 这样的代码
    canCompile: res.code.includes("_c("),
  };
}
