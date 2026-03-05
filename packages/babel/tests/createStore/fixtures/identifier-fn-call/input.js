// 属性作为函数参数传递
function FnCall() {
  const state = store.useSnapshot();
  return <div onClick={() => foo(state.count)}>{state.name}</div>;
}
