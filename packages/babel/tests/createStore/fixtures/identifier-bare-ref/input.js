// 裸引用混合属性访问，应不转换
function BareRef() {
  const state = store.useSnapshot();
  console.log(state);
  return <div>{state.a}</div>;
}
