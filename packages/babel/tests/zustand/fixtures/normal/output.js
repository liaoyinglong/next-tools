function Normal() {
  const state = store.useShallowSnapshot((s) => {
    return {
      a: s.a,
      c: s.c,
    };
  });

  return (
    <div>
      {state.a}
      --
      {state.c.name}
    </div>
  );
}
function Destructure() {
  const {
    a,
    c: { name },
  } = store.useShallowSnapshot(({ a, c: { name } }) => {
    return {
      a,
      c: { name },
    };
  });
  return (
    <div>
      {a} -- {name}
    </div>
  );
}

function Keep() {
  const state = store.useSnapshot();
  return <div state={state}>keep</div>;
}
function Keep2() {
  const state = store.useSnapshot();
  return <div state={state}>{state.a}</div>;
}
