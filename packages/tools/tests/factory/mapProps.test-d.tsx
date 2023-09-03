import { ComponentProps, PropsWithChildren } from "react";
import { assertType, describe, it } from "vitest";
import { mapProps } from "../../src/factory/mapProps";

interface Props {
  age?: number;
  name?: string;
  work: string;
  work2: string;
  className?: string;
  style?: React.CSSProperties;
}

function App(props: PropsWithChildren<Props>) {
  return null;
}

describe("mapProps", () => {
  it("map with object ", () => {
    const App2 = mapProps(App, {
      work: "programmer",
    });
    type App2Props = ComponentProps<typeof App2>;
    assertType<App2Props>({
      work2: "sda",
    });
  });
});
