// 属性赋值给其他变量
function Assign() {
  const state = store.useSnapshot();
  const x = state.a;
  const y = state.b;
  return (
    <div>
      {x} - {y}
    </div>
  );
}
