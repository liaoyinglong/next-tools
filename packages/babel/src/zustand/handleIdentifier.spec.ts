import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { describe, it } from "vitest";
import { handleIdentifier } from "./handleIdentifier";
import { isNeedTransform } from "./shared";

describe("handleIdentifier", () => {
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
        const { init } = path.node;
        if (!isNeedTransform(init)) {
          return;
        }
        handleIdentifier(path);
      },
    });

    let res = generate(ast, {
      retainLines: true,
    });

    console.log(res.code);
    //expect(res.code).toEqual(code);
  });
});
