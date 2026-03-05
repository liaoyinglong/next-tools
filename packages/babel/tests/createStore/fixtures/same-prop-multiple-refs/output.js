function _selector_(state) {
  return {
    count: state.count,
    name: state.name,
  };
}
function SamePropMultipleRefs() {
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      <span>{state.count}</span>
      <span>{state.count}</span>
      <span>{state.name}</span>
    </div>
  );
}
