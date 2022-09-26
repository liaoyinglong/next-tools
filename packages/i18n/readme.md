## @dune/i18n

基于 [lingui](https://lingui.js.org/ref/macro.html) 包装的 i18n 工具。

由于`next.js 12`默认使用 `swc`编译，所以`lingui`的`babel`插件有些过时，这里提供了一系列基于`swc`的工具来对齐`lingui`部分功能。

- 支持`lingui`的`macro`插件中的`t`/`Trans`
- 支持提取翻译

### features

**需要启用`@dune/swc-plugin`来编译**

- 提供`t`函数，用于翻译

```js
const name = "dune";

// 启用 `@dune/swc-plugin` 可以使用以下方式
t`hello ${name}`; // hello dune
// 编译成，也可以直接写成下面的代码
t("hello {name}", { name }); // hello dune
```

- 提供`Trans`组件

```jsx
<Trans>Attachment {name} saved.</Trans>
// 编译成
<Trans id='Attachment {name} saved.' values={{name}}></Trans>
```

```jsx
<Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
// 编译成
<Trans
  id="Attachment {0} saved."
  values={{ 0: props.name ?? defaultName }}
></Trans>;
```

```jsx
<Trans>
  Read the <a href="/docs">docs</a>.
</Trans>;
// 编译成
<Trans id="Read the <0>docs</0>." components={{ 0: <a href="/docs" /> }} />;
```

### 配置`next.config.js`

- 启用`@dune/swc-plugin`

```js
const config = {
  // ...
  experimental: {
    externalDir: !!1,
    /**
     * @see https://nextjs.org/docs/advanced-features/compiler#swc-plugins-experimental
     */
    swcPlugins: [
      // 添加 `@dune/swc-plugin` 插件
      ["@dune/swc-plugin", {}],
    ],
  },
};
```

- 配置`webpack`

```js
const config = {
  // ...
  webpack: (config) => {
    config.plugins.unshift(
      // auto import
      require("unplugin-auto-import/webpack")({
        imports: [
          "react",
          {
            "@dune/i18n": ["t", "Trans"],
          },
        ],
      }),
      // 预先编译i18n文件，抽取其中的翻译变量等等
      require("@dune/unplugin").i18nResourcePlugin.webpack()
    );
    return config;
  },
};
```
