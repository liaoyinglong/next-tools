## i18n-swc-plugin

### features

转换`t`/`Trans`调用

```js
const name = "dune";

// 启用 `@dune/swc-plugin` 可以使用以下方式
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
