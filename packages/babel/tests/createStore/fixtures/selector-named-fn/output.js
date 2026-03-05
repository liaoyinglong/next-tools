function NamedSelector() {
  const state = store.useSnapshot(mySelector);
  return <div>{state.count}</div>;
}
