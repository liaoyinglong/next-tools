function NonSnapshot() {
  const state = store.useOther();
  return <div>{state.a}</div>;
}
function NonSnapshot2() {
  const { a } = store.getState();
  return <div>{a}</div>;
}
