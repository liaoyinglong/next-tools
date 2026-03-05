// 可选链访问
function OptionalChaining() {
  const state = store.useSnapshot();
  return (
    <div>
      {state?.a}
      --
      {state?.b?.name}
    </div>
  );
}
