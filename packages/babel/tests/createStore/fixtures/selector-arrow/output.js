function ArrowSelector() {
  const state = store.useShallowSnapshot((s) => ({
    count: s.count,
    name: s.name,
  }));
  return (
    <div>
      {state.count} - {state.name}
    </div>
  );
}
function ArrowSelectorPrimitive() {
  const count = store.useSnapshot((s) => s.count);
  return <div>{count}</div>;
}
