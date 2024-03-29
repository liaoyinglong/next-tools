import { createStateContext } from "@dune2/tools/factory/createStateContext";
import { useState } from "react";

export const { Provider, useContextValue } = createStateContext({
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
