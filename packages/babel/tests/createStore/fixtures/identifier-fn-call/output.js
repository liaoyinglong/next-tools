function _selector_(state) {
  return {
    count: state.count,
    name: state.name,
  };
}
function FnCall() {
  const state = store.useShallowSnapshot(_selector_);
  return <div onClick={() => foo(state.count)}>{state.name}</div>;
}
