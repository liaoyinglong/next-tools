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
- 支持`t/Trans`的编译宏，

### 注意事项

#### `t`方法注意事项

**当前版本不再自动导入`t`方法，需要手动导入。**

- 在组件外使用，需要手动从`@dune2/tools`引入`t`方法
- 在组件内使用，需要调用`useT`方法，如下

```tsx
const App = () => {
  const t = useT(); // 会自动导入 useT，调用了 useT 后，更改语言的时候才会触发组件的重新渲染
  return <div>{t("hello")}</div>;
};
```

### options

see types `DunePresetsOptions`
