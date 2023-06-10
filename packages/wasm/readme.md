## wasm 包集合

基于 WebAssembly 的 rust 语言包集合。

### extract

基于`swc`实现，从源码中提取文案，暴露此方法，当前用在`cli`处提取文案并写入`json`文件。

see test file [extract.spec.ts](js-test/extract.spec.ts)

## 开发

## 打包

依赖 `wasm-pack`，需要安装

```bash
# https://rustwasm.github.io/wasm-pack/installer/
cargo install wasm-pack
```
