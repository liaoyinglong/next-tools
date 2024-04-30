import { act, render } from "@testing-library/react";
import { useSnapshot, proxy as valtioProxy } from "valtio";
import { describe, expect, it, vi } from "vitest";
import { proxy } from "../../valtio";
import { computed } from "../../valtio/computed";

describe("computed", () => {
  describe("base valtio", () => {
    it("简单类型 getter 触发少次 getter", async () => {
      const storeA = valtioProxy({
        count: 0,
        name: "hello",
      });

      const doubleCountGetter = vi.fn();
      const doubleCountFromInfoGetter = vi.fn();
      const simpleTrack = vi.fn();
      const complexTrack = vi.fn();
      const infoGetter = vi.fn();

      const storeB = valtioProxy({
        a: storeA,
        get info() {
          infoGetter();
          return {
            doubleCount: storeB.a.count * 2,
          };
        },
        get doubleCountFromInfo() {
          doubleCountFromInfoGetter();
          return storeB.info.doubleCount;
        },
        get doubleCount(): number {
          doubleCountGetter();
          return storeB.a.count * 2;
        },
      });
      function Simple() {
        const { doubleCount } = useSnapshot(storeB);
        simpleTrack(doubleCount);
        return <div>doubleCount: {doubleCount}</div>;
      }
      function Complex() {
        const { doubleCountFromInfo } = useSnapshot(storeB);
        const doubleCount = doubleCountFromInfo;
        complexTrack(doubleCount);
        return <div>doubleCount: {doubleCount}</div>;
      }

      render(
        <>
          <Simple></Simple>
          <Simple></Simple>
          <Simple></Simple>
          <Complex></Complex>
          <Complex></Complex>
          <Complex></Complex>
        </>,
      );

      expect(doubleCountGetter).toBeCalledTimes(1);
      expect(simpleTrack).toBeCalledTimes(3 * 1);
      expect(simpleTrack).lastCalledWith(0);

      expect(infoGetter).toBeCalledTimes(2 * 1);
      expect(doubleCountFromInfoGetter).toBeCalledTimes(1);
      expect(complexTrack).toBeCalledTimes(3 * 1);
      expect(complexTrack).lastCalledWith(0);

      await act(() => {
        storeA.name = "world";
      });
      // 更改了 name，触发了不要的 getter
      expect(doubleCountGetter).toBeCalledTimes(2);
      expect(simpleTrack).toBeCalledTimes(3 * 1);
      expect(simpleTrack).lastCalledWith(0);

      expect(infoGetter).toBeCalledTimes(2 * 2);
      expect(doubleCountFromInfoGetter).toBeCalledTimes(2);
      expect(complexTrack).toBeCalledTimes(3 * 1);
      expect(complexTrack).lastCalledWith(0);

      await act(() => {
        storeA.count++;
      });
      expect(doubleCountGetter).toBeCalledTimes(3);
      expect(simpleTrack).toBeCalledTimes(3 * 2);
      expect(simpleTrack).lastCalledWith(2);

      expect(infoGetter).toBeCalledTimes(2 * 3);
      expect(doubleCountFromInfoGetter).toBeCalledTimes(3);
      expect(complexTrack).toBeCalledTimes(3 * 2);
      expect(complexTrack).lastCalledWith(2);
    });
  });

  it("will trigger necessary times getter", async () => {
    const doubleCountGetter = vi.fn();
    const doubleCountFromInfoGetter = vi.fn();
    const simpleTrack = vi.fn();
    const complexTrack = vi.fn();
    const infoGetter = vi.fn();

    const storeA = proxy(
      {
        count: 0,
        name: "hello",
      },
      { name: "storeA" },
    );
    const storeB = proxy(
      {
        info: computed(storeA, () => {
          infoGetter();
          return {
            doubleCount: storeA.count * 2,
          };
        }),
        get doubleCountFromInfo() {
          doubleCountFromInfoGetter();
          return storeB.info.doubleCount;
        },
        doubleCount: computed(storeA, (a) => {
          doubleCountGetter();
          return a.count * 2;
        }),
      },
      { name: "storeB" },
    );

    function Simple() {
      const { doubleCount } = useSnapshot(storeB);
      simpleTrack(doubleCount);
      return <div>doubleCount: {doubleCount}</div>;
    }
    function Complex() {
      const { doubleCountFromInfo } = useSnapshot(storeB);
      const doubleCount = doubleCountFromInfo;
      complexTrack(doubleCount);
      return <div>doubleCount: {doubleCount}</div>;
    }

    render(
      <>
        <Simple></Simple>
        <Simple></Simple>
        <Simple></Simple>
        <Complex></Complex>
        <Complex></Complex>
        <Complex></Complex>
      </>,
    );
    expect(doubleCountGetter).toBeCalledTimes(1);
    expect(simpleTrack).toBeCalledTimes(3 * 1);
    expect(simpleTrack).lastCalledWith(0);

    expect(infoGetter).toBeCalledTimes(1);
    expect(doubleCountFromInfoGetter).toBeCalledTimes(1);
    expect(complexTrack).toBeCalledTimes(3 * 1);
    expect(complexTrack).lastCalledWith(0);

    await act(() => {
      storeA.name = "world";
    });
    // 更改了 name，触发了不要的 getter
    expect(doubleCountGetter).toBeCalledTimes(2);
    expect(simpleTrack).toBeCalledTimes(3 * 1);
    expect(simpleTrack).lastCalledWith(0);

    expect(infoGetter).toBeCalledTimes(2);
    expect(doubleCountFromInfoGetter).toBeCalledTimes(1);
    expect(complexTrack).toBeCalledTimes(3 * 1);
    expect(complexTrack).lastCalledWith(0);

    await act(() => {
      storeA.count++;
    });
    expect(doubleCountGetter).toBeCalledTimes(3);
    expect(simpleTrack).toBeCalledTimes(3 * 2);
    expect(simpleTrack).lastCalledWith(2);

    expect(infoGetter).toBeCalledTimes(3);
    expect(doubleCountFromInfoGetter).toBeCalledTimes(2);
    expect(complexTrack).toBeCalledTimes(3 * 2);
    expect(complexTrack).lastCalledWith(2);
  });

  it("should work", async () => {
    const storeA = proxy(
      {
        count: 0,
        info: {
          name: "hello",
          age: 18,
        },
      },
      { name: "storeA" },
    );
    const storeB = proxy(
      {
        infoName: computed(storeA, (a) => {
          return a.info.name;
        }),
        infoAge: computed(storeA, (a) => {
          return a.info.age;
        }),
      },
      { name: "storeB" },
    );
    function App() {
      const { infoAge, infoName } = storeB.useSnapshot();
      return (
        <div>
          <div>infoAge: {infoAge}</div>
          <div>infoName: {infoName}</div>
        </div>
      );
    }

    const { rerender, queryAllByText } = render(<App></App>);

    expect(queryAllByText("infoAge: 18")).toHaveLength(1);
    expect(queryAllByText("infoName: hello")).toHaveLength(1);

    await act(() => {
      storeA.info.name = "world";
      storeA.info.age = 20;
    });

    expect(queryAllByText("infoAge: 20")).toHaveLength(1);
    expect(queryAllByText("infoName: world")).toHaveLength(1);
  });
});
