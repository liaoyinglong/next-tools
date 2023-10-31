import { ComponentProps, PropsWithChildren } from "react";
import { assertType, describe, it } from "vitest";
import { mapProps } from "../../factory/mapProps";

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
  it("map object with custom Component props ", () => {
    const App2 = mapProps(App, {
      work: "programmer",
    });
    type App2Props = ComponentProps<typeof App2>;
    assertType<App2Props>({
      work2: "sda",
    });
    // @ts-expect-error 缺少必填的 work2 字段
    assertType<App2Props>({});
  });

  it("map function with custom Component props ", () => {
    const App2 = mapProps(App, () => {
      return {
        work: "programmer",
      };
    });
    type App2Props = ComponentProps<typeof App2>;
    assertType<App2Props>({
      work2: "sda",
    });
    // @ts-expect-error 缺少必填的 work2 字段
    assertType<App2Props>({});
  });
});
