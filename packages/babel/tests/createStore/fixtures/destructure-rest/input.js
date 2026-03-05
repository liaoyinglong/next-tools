// 解构 + rest 展开
function DestructureRest() {
  const { a, ...rest } = store.useSnapshot();
  return (
    <div>
      {a} - {rest.b}
    </div>
  );
}
