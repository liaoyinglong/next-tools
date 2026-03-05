function _selector_(state) {
  return {
    'a.b.c': state.a.b.c,
    'x.y': state.x.y,
  };
}
function DeepAccess() {
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {state['a.b.c']}
      --
      {state['x.y']}
    </div>
  );
}
