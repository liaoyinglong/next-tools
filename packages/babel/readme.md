# @dune2/babel

[@dune2/tools](../tools) `store.useSnapshot()` 的 Babel 编译时优化插件。

插件会静态分析组件里 `useSnapshot()` 返回值的属性访问，自动生成 selector 并把调用改写成 `useShallowSnapshot(selector)`，让 `@dune2/tools/store` 的浅比较生效——写法不变，重渲染变少。

## 安装

```bash
pnpm add -D @dune2/babel
```

需要 `@babel/core` v8 作为 peer dependency（已由宿主项目提供）。

## 使用

```javascript
// babel.config.mjs
import { createStorePlugin } from '@dune2/babel/createStore';

export default {
  plugins: [createStorePlugin],
};
```

也可以从包根导入：

```javascript
import { createStorePlugin } from '@dune2/babel';
```

## 效果

```tsx
// 编译前
function Counter() {
  const state = store.useSnapshot();
  return (
    <div>
      {state.count} -- {state.user.name}
    </div>
  );
}

// 编译后
function _selector_(state) {
  return { count: state.count, 'user.name': state.user.name };
}
function Counter() {
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {state.count} -- {state['user.name']}
    </div>
  );
}
```

解构写法同样会被处理：

```tsx
const {
  count,
  user: { name },
} = store.useSnapshot();
// ->
const {
  count,
  user: { name },
} = store.useShallowSnapshot(_selector_);
```

## 保守跳过的场景

以下写法无法静态确定访问范围，插件会保持原样：

- 整体传递：`<Child state={state} />`
- 返回原始值的 selector：`useSnapshot((s) => s.count)`
- 返回数组的 selector：`useSnapshot((s) => [s.a, s.b])`
- 命名函数引用：`useSnapshot(mySelector)`
- 同一变量既有属性访问又有整体引用

生成的 selector 会被提升到组件外部（`_selector_`、`_selector_2` …），不会在每次渲染时重建。

## 相关

- 运行时 API 见 [@dune2/tools](../tools) 的 `store` 模块
- 完整文档见 [docs/content/docs/babel.mdx](../../docs/content/docs/babel.mdx)

## License

MIT
