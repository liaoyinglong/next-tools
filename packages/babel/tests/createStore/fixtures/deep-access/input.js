// 深层属性访问
function DeepAccess() {
  const state = store.useSnapshot();
  return (
    <div>
      {state.a.b.c}
      --
      {state.x.y}
    </div>
  );
}
