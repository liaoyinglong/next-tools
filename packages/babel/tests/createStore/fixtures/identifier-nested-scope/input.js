// 在回调/嵌套函数中引用属性
function NestedScope() {
  const state = store.useSnapshot();
  useEffect(() => {
    console.log(state.count);
  }, [state.count]);
  return <div>{state.name}</div>;
}
