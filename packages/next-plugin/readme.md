## @dune/next-plugin

内置部分插件，方便使用

使用示例

```js
// next.config.js
const { withDunePresets } = require("@dune/next-plugin");
module.exports = withDunePresets(duneConfig)(nextConfig);
```

### features

- 支持配置`auto-import`，由[`unplugin-auto-import`](https://github.com/antfu/unplugin-auto-import)实现
- 支持配置编译部分`node_modules`依赖
- 支持`.i18n.json`文件预编译
- 支持`t/Trans`的编译宏

### options

see types `DunePresetsOptions`
