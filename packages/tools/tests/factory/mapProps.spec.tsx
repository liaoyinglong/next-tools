import { render } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapProps } from "../../src/factory/mapProps";

interface Props {
  age?: number;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

const spy = vi.fn();
function App(props: PropsWithChildren<Props>) {
  spy(props);
  return null;
}
beforeEach(() => {
  spy.mockClear();
});

describe("mapProps", () => {
  describe("should work with custom component", () => {
    it("map with object ", () => {
      const MappedApp = mapProps(App, {
        className: "newClassName",
        age: 10,
        style: { display: "flex" },
      });
      render(<MappedApp name="test" />);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({
        className: "newClassName",
        age: 10,
        style: { display: "flex" },
        name: "test",
      });
    });
    it("map with function ", () => {
      const MappedApp = mapProps(App, (p) => ({
        ...p,
        className: "newClassName",
        age: 10,
        style: { display: "flex" },
      }));
      render(<MappedApp name="test" />);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({
        className: "newClassName",
        age: 10,
        style: { display: "flex" },
        name: "test",
      });
    });
  });

  describe("should work with intrinsic component", () => {
    it("map with object ", () => {
      const Container = mapProps("div", {
        className: "container",
        style: { display: "flex" },
      });
      const { container } = render(<Container />);
      expect(container.firstChild).toMatchInlineSnapshot(`
          <div
            class="container"
            style="display: flex;"
          />
      `);
    });
    it("map with function ", () => {
      const Container = mapProps("div", (p) => ({
        ...p,
        className: "container " + (p.className ?? ""),
        style: { display: "flex", ...p.style },
      }));
      const { container } = render(
        <Container
          className={"container2"}
          style={{
            color: "red",
          }}
        />
      );
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class="container container2"
          style="display: flex; color: red;"
        />
      `);
    });
  });
});
