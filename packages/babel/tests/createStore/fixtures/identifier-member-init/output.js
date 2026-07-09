function _selector_(state) {
  return {
    entries: state.entries,
  };
}
function EntriesFromSnapshot() {
  const entries = requestMonitorStore.useShallowSnapshot(_selector_).entries;
  return <div>{entries.length}</div>;
}
