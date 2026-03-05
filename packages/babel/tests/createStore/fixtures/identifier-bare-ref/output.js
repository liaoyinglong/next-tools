function BareRef() {
  const state = store.useSnapshot();
  console.log(state);
  return <div>{state.a}</div>;
}
