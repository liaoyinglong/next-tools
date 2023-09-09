import { createStateContext } from "@dune2/tools/src/factory/createStateContext";
import { useState } from "react";

const { Provider, useContextValue } = createStateContext({
  useValueHooks() {
    const [count, setCount] = useState(0);
    return {
      count,
      increment() {
        setCount(count + 1);
      },
    };
  },
});

function ChildA() {
  const { increment } = useContextValue();
  return <button onClick={increment}>increment</button>;
}
function ChildB() {
  const { count } = useContextValue();
  return <div>count: {count}</div>;
}

export default function App() {
  return (
    <Provider>
      <ChildA></ChildA>
      <ChildB></ChildB>
    </Provider>
  );
}
