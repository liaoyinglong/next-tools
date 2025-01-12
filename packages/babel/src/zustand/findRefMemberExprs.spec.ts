import { parse, parseExpression } from "@babel/parser";
import traverse from "@babel/traverse";
import t, { type Expression } from "@babel/types";
import { describe, expect, it } from "vitest";
import { findRefMemberExprs } from "./findRefMemberExprs";
import { isNeedTransform } from "./shared";

describe("findRefMemberExprs", () => {
  it("correct", () => {
    const tsx = String.raw;
    const code = tsx`
    function App(){
        const a = store.useSnapshot()
        useEffect(() => {
            console.log(a?.b)
        },[])
        return <div>
             <span>{a.c.name}</span>
          </div>
    }`;
    const ast = parse(code, {
      plugins: ["typescript", "jsx"],
    });

    let props: Expression[] | undefined = [];

    traverse(ast, {
      VariableDeclarator(path) {
        const { init } = path.node;
        if (!isNeedTransform(init)) {
          return;
        }
        props = findRefMemberExprs(path);
      },
    });

    expect(props?.length).toEqual(2);

    expect(
      t.isNodesEquivalent(props?.[0], parseExpression("a?.b")),
    ).toBeTruthy();
    expect(
      t.isNodesEquivalent(props?.[1], parseExpression("a.c.name")),
    ).toBeTruthy();
  });
});
