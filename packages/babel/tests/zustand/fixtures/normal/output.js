function Normal() {
  function _selector_(state) {
    return {
      _prop_: state.a,
      _prop_2: state.c.name,
    };
  }
  const state = store.useShallowSnapshot(_selector_);
  return (
    <div>
      {state._prop_}
      --
      {state._prop_2}
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
  function _selector_3(state) {
    return {
      _prop_3: state.a,
    };
  }
  const state = store.useShallowSnapshot(_selector_3);
  return <div state={state}>{state._prop_3}</div>;
}
function Keep3() {
  const state = store.useSnapshot((s) => {
    return {
      count: s.count,
    };
  });
  return <div>{state.count}</div>;
}
