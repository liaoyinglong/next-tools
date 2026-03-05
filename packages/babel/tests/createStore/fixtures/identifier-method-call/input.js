// 属性后调用方法
function MethodCall() {
  const state = store.useSnapshot();
  return (
    <div>
      {state.items.map((item) => (
        <span key={item.id}>{item.name}</span>
      ))}
    </div>
  );
}
