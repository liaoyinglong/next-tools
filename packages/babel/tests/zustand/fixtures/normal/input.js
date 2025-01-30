function Normal() {
  const state = store.useSnapshot();

  return (
    <div>
      {state.a}
      --
      {state.c.name}
    </div>
  );
}
// 解构
function Destructure() {
  const {
    a,
    c: { name },
  } = store.useSnapshot();
  return (
    <div>
      {a} -- {name}
    </div>
  );
}

// 不需要转换
function Keep() {
  const state = store.useSnapshot();
  return <div state={state}>keep</div>;
}
function Keep2() {
  const state = store.useSnapshot();
  return <div state={state}>{state.a}</div>;
}
function Keep3() {
  const state = store.useSnapshot((s) => {
    return {
      count: s.count,
    };
  });
  return <div>{state.count}</div>;
}
