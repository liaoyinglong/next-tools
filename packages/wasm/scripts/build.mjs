import { $, echo, fs } from "zx";

echo("testing wasm...");
await $`cargo test`;

echo("Building wasm...");
await fs.emptyDir("./pkg");
await $`wasm-pack build --target nodejs`;
await fs.rm("./pkg/.gitignore");

echo("wasm build complete!");
