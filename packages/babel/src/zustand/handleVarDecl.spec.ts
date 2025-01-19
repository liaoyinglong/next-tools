import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { describe, expect, it } from "vitest";
import { handleVarDecl } from "./handleVarDecl";

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

    console.log(res.code);
    expect(res.code).toMatchInlineSnapshot(`
      "
      function App() {function _$$zp_selector(a) {return { _$$zp_: a?.b, _$$zp_2: a?.b, _$$zp_3: a.c.name };}
        const a = store.useShallowSnapshot(_$$zp_selector);
        useEffect(() => {
          console.log(_$$zp_);
        }, [_$$zp_2]);
        function f(a) {
          return (
            <div>
              <span>{a.e}</span>
            </div>);

        }
        return (
          <div>
            <span>{_$$zp_3}</span>
          </div>);

      }"
    `);
  });
});
