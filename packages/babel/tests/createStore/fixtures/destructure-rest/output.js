function _selector_({ a, ...rest }) {
  return {
    a,
    ...rest,
  };
}
function DestructureRest() {
  const { a, ...rest } = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {a} - {rest.b}
    </div>
  );
}
