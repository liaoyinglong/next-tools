function _selector_(state) {
  return {
    a: state?.a,
    'b.name': state?.b?.name,
  };
}
function OptionalChaining() {
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {state.a}
      --
      {state['b.name']}
    </div>
  );
}
