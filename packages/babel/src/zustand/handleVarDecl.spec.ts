import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { describe, expect, it } from "vitest";
import { handleVarDecl } from "./handleVarDecl";

function transform(code: string) {
  const ast = parse(code, {
    plugins: ["typescript", "jsx"],
  });

  traverse(ast, {
    VariableDeclarator(path) {
      handleVarDecl(path);
    },
  });

  let res = generate(ast, {
    retainLines: true,
  });

  return res.code;
}

describe("handleVarDecl", () => {
  it("correct", () => {
    const tsx = String.raw;
    const code = tsx`
function App() {
  const a = store.useSnapshot();
  useEffect(() => {
    console.log(a?.b);
  }, [a?.b]);
  function f(a) {
    return (
      <div>
        <span>{a.e}</span>
      </div>
    );
  }
  return (
    <div>
      <span>{a.c.name}</span>
    </div>
  );
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function App() {function _zp_selector(a) {return { _zp_: a?.b, _zp_2: a?.b, _zp_3: a.c.name };}
        const a = store.useShallowSnapshot(_zp_selector);
        useEffect(() => {
          console.log(a._zp_);
        }, [a._zp_2]);
        function f(a) {
          return (
            <div>
              <span>{a.e}</span>
            </div>);

        }
        return (
          <div>
            <span>{a._zp_3}</span>
          </div>);

      }"
    `);
  });
});
