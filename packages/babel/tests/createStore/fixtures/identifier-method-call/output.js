function _selector_(state) {
  return {
    items: state.items,
  };
}
function MethodCall() {
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {state.items.map((item) => (
        <span key={item.id}>{item.name}</span>
      ))}
    </div>
  );
}
