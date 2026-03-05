// 箭头函数 selector 返回数组，不做转换
function ArrowSelectorArray() {
  const state = store.useSnapshot((s) => [s.a, s.b]);
  return <div>{state}</div>;
}
