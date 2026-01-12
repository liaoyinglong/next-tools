import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { describe, expect, it } from "vitest";
import { handleObjectPattern } from "./handleObjectPattern";

function transform(code: string) {
  const ast = parse(code, {
    plugins: ["typescript", "jsx"],
  });

  traverse(ast, {
    VariableDeclarator(path) {
      handleObjectPattern(path);
    },
  });

  let res = generate(ast, {
    retainLines: true,
  });

  return res.code;
}

describe("handleObjectPattern", () => {
  it("correct", () => {
    const tsx = String.raw;
    const code = tsx`
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
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function Destructure() {function _selector_({ a, c: { name } }) {return { a, c: { name } };}
        const {
          a,
          c: { name }
        } = store.useShallowSnapshot(_selector_);
        return (
          <div>
            {a} -- {name}
          </div>);

      }"
    `);
  });

  it("should_keep_selector_when_snapshot_has_selector", () => {
    const tsx = String.raw;
    const code = tsx`
function App() {
  const {count} = store.useSnapshot((s) => {
    return {
      count: s.count,
    };
  });
  return <div>{count}</div>;
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function App() {
        const { count } = store.useShallowSnapshot((s) => {
          return {
            count: s.count
          };
        });
        return <div>{count}</div>;
      }"
    `);
  });
  it("raw keep", () => {
    const tsx = String.raw;
    const code = tsx`
function App() {
  const state = store.useSnapshot((s) => {
    return s.user
  });
   const state2 = store.useSnapshot((s) => {
    return s.count
  });
  
  return <div>{state.count}</div>;
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function App() {
        const state = store.useSnapshot((s) => {
          return s.user;
        });
        const state2 = store.useSnapshot((s) => {
          return s.count;
        });

        return <div>{state.count}</div>;
      }"
    `);
  });
});
