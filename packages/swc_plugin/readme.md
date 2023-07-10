## i18n-swc-plugin

### features

转换`t`/`Trans`调用

```js
const name = "dune";

// 启用 `@dune2/swc-plugin` 可以使用以下方式
t`hello ${name}`; // hello dune
// 编译成，也可以直接写成下面的代码
t("hello {name}", { name }); // hello dune
```

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

### develop

| 环境变量 | 可选值        | 说明            | 库      |
| -------- | :------------ | --------------- | ------- |
| RUST_LOG | info、debug.. | log 开关        | tracing |
| UPDATE   | 1             | 是否更新 output | testing |

## 与`next.js`版本兼容

| next.js    | 插件版本 |
| ---------- | -------- |
| <=13.3.1   | 0.2.x    |
| \>=13.3.1  | 0.3.0    |
| \>=13.4.3  | 0.3.1    |
| \>= 13.4.9 | \>=0.3.5 |

## 与 `@swc/core` 版本兼容

| @swc/core |       |
| --------- | ----- |
| 1.3.55    | 0.3.0 |
| 1.3.58    | 0.3.3 |
