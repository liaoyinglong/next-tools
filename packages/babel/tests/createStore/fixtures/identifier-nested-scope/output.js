function _selector_(state) {
  return {
    count: state.count,
    name: state.name,
  };
}
function NestedScope() {
  const state = store.useShallowSnapshot(_selector_);
  useEffect(() => {
    console.log(state.count);
  }, [state.count]);
  return <div>{state.name}</div>;
}
