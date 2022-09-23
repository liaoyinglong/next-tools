import { $, echo, fs } from "zx";

await fs.emptyDir("./dist");
echo("Building...");

await $`cargo build-wasi --release`;
echo(`Built swc_plugin.wasm`);

await fs.copyFile(
  `./target/wasm32-wasi/release/s_swc_plugin.wasm`,
  `./dist/swc_plugin.wasm`
);

echo(`Copied swc_plugin.wasm to dist`);

echo("run js side test");

await $`vitest run`;

echo("Done");
