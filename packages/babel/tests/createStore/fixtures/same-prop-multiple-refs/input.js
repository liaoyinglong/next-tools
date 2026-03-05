// 同一属性多次引用，只生成一个 selector key
function SamePropMultipleRefs() {
  const state = store.useSnapshot();
  return (
    <div>
      <span>{state.count}</span>
      <span>{state.count}</span>
      <span>{state.name}</span>
    </div>
  );
}
