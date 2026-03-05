// 解构重命名
function DestructureRename() {
  const { a: renamed, b: other } = store.useSnapshot();
  return (
    <div>
      {renamed} - {other}
    </div>
  );
}
