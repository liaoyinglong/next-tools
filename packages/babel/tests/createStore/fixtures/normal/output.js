function Normal() {
  function _selector_(state) {
    return {
      a: state.a,
      'c.name': state.c.name,
    };
  }
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {state.a}
      --
      {state['c.name']}
    </div>
  );
}
function Destructure() {
  function _selector_2({ a, c: { name } }) {
    return {
      a,
      c: {
        name,
      },
    };
  }
  const {
    a,
    c: { name },
  } = store.useShallowSnapshot(_selector_2);
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
function Keep3() {
  const state = store.useShallowSnapshot((s) => {
    return {
      count: s.count,
    };
  });
  return <div>{state.count}</div>;
}
