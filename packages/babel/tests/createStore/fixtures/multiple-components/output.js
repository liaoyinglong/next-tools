function _selector_(state) {
  return {
    x: state.x,
  };
}
function CompA() {
  const state = store.useShallowSnapshot(_selector_);
  return <span>{state.x}</span>;
}
function _selector_2(data) {
  return {
    y: data.y,
  };
}
function CompB() {
  const data = store.useShallowSnapshot(_selector_2);
  return <span>{data.y}</span>;
}
