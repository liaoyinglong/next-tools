// useSnapshot return value member access assignment
function EntriesFromSnapshot() {
  const entries = requestMonitorStore.useSnapshot().entries;
  return <div>{entries.length}</div>;
}
