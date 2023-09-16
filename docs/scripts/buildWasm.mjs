import path from "path";
import { fileURLToPath } from "url";
import { $, cd } from "zx";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const wasmSourceDir = path.resolve(__dirname, "../../packages/wasm");
const outDir = path.resolve(__dirname, "../shared/wasm-pkg");

// in windows , the absolute path of outDir is like "D:\a\wasm\wasm"
// but can not use it in the command line, so we need to get the relative path
const r = path.relative(wasmSourceDir, outDir);
// console.log(r);
console.log("开始构建 wasm 包");
cd(wasmSourceDir);
const cmd = `wasm-pack build --target web --out-dir ${r}`;
await $([cmd]);
console.log("构建 wasm 包完成");
