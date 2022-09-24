import { $, echo, fs } from "zx";

await $`cargo test`;

await fs.emptyDir("./dist");
echo("Building...");

// FIXME: 这里手动控制编译目标，后续优化
if (1) {
  await $`cargo build-wasi`;
  echo(`Built swc_plugin.wasm`);
  await fs.copyFile(
    `./target/wasm32-wasi/release/s_swc_plugin.wasm`,
    `./dist/swc_plugin.wasm`
  );
} else {
  await $`cargo build-wasm32`;
  echo(`Built swc_plugin.wasm`);
  await fs.copyFile(
    `./target/wasm32-unknown-unknown/release/s_swc_plugin.wasm`,
    `./dist/swc_plugin.wasm`
  );
}

echo(`Copied swc_plugin.wasm to dist`);

echo("run js side test");

await $`vitest run`;

echo("Done");
