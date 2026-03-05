function _selector_(state) {
  return {
    a: state.a,
    b: state.b,
  };
}
function Assign() {
  const state = store.useShallowSnapshot(_selector_);
  const x = state.a;
  const y = state.b;
  return (
    <div>
      {x} - {y}
    </div>
  );
}
