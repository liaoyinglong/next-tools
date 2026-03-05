// 多个组件各自使用 useSnapshot
function CompA() {
  const state = store.useSnapshot();
  return <span>{state.x}</span>;
}
function CompB() {
  const data = store.useSnapshot();
  return <span>{data.y}</span>;
}
