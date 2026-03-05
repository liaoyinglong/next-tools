function ArrowSelectorArray() {
  const state = store.useSnapshot((s) => [s.a, s.b]);
  return <div>{state}</div>;
}
