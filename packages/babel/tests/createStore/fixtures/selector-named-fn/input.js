// 具名函数引用作为 selector，应保持不变
function NamedSelector() {
  const state = store.useSnapshot(mySelector);
  return <div>{state.count}</div>;
}
