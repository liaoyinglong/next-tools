function _selector_({ a: renamed, b: other }) {
  return {
    a: renamed,
    b: other,
  };
}
function DestructureRename() {
  const { a: renamed, b: other } = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {renamed} - {other}
    </div>
  );
}
