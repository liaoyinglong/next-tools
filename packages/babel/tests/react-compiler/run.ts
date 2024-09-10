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
  const reactCompilerConfig = {
    // react compiler 的 logger
    logger: {
      logEvent(file, event) {
        if (process.env.REACT_COMPILER_DEBUG) {
          if (event.kind === "CompileError") {
            //console.log(event);
            // https://github.com/facebook/react/blob/f603426f917314561c4289734f39b972be3814af/compiler/packages/eslint-plugin-react-compiler/src/rules/ReactCompilerRule.ts#L160
            const detail = event.detail;
            const locStr =
              detail.loc != null && typeof detail.loc !== "symbol"
                ? ` (${file}:${detail.loc.start.line}:${detail.loc.start.column})`
                : "";
            const reason = detail.reason;
            if (
              reason.includes('Skipped due to "use no forget" directive.') ||
              reason.includes("React ESLint rules were disabled")
            ) {
              return;
            }

            console.log(`[ReactCompilerBailout] ${detail.reason}${locStr}`);
          }
        }
      },
    },
  };

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
