// 箭头函数 selector 返回对象
function ArrowSelector() {
  const state = store.useSnapshot((s) => ({
    count: s.count,
    name: s.name,
  }));
  return (
    <div>
      {state.count} - {state.name}
    </div>
  );
}
// 箭头函数 selector 返回原始值，不做转换
function ArrowSelectorPrimitive() {
  const count = store.useSnapshot((s) => s.count);
  return <div>{count}</div>;
}
